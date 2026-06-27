import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptMovieInvitation,
  cancelCineMeetGroup,
  cancelMovieInvitation,
  createMovieInvitation,
  getCineMeetShowtimes,
  getCineMeetGroupForMatch,
  getMatchInvitations,
  getMatchMessages,
  rejectMovieInvitation,
  selectGroupSeat,
  sendMatchMessage,
  updateGroupPayment,
} from "../../../services/cinemeetService";
import { cineMeetRealtime } from "../../../services/cineMeetRealtime";

const invitationLabels = {
  PROPOSED: "Đang chờ phản hồi",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã hủy",
};

const groupLabels = {
  WAITING: "Đang chờ đặt vé",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

const seatTypeLabels = {
  STANDARD: "Thường",
  VIP: "VIP",
  COUPLE: "Đôi",
};

const parseSeatLabel = (label = "") => {
  const match = String(label).match(/^([A-Za-z]+)(\d+)$/);
  return {
    row: match?.[1] ?? "Khác",
    column: Number(match?.[2] ?? 0),
  };
};

const buildSeatRows = (seats = []) => {
  const rows = new Map();
  seats.forEach((seat) => {
    const parsed = parseSeatLabel(seat.label);
    if (!rows.has(parsed.row)) rows.set(parsed.row, []);
    rows.get(parsed.row).push({ ...seat, rowLabel: parsed.row, columnNumber: parsed.column });
  });

  return [...rows.entries()]
    .sort(([rowA], [rowB]) => rowA.localeCompare(rowB, "vi", { numeric: true }))
    .map(([rowLabel, rowSeats]) => ({
      rowLabel,
      seats: rowSeats.sort((a, b) => a.columnNumber - b.columnNumber),
    }));
};

const findAdjacentSeatIds = (anchorSeat, seats = [], members = []) => {
  if (!anchorSeat) return new Set();

  const occupiedIds = new Set(members.map((member) => Number(member.seatId)).filter(Boolean));
  const parsedAnchor = parseSeatLabel(anchorSeat.label);
  return new Set(
    seats
      .filter((seat) => {
        const parsedSeat = parseSeatLabel(seat.label);
        const isNextToAnchor =
          parsedSeat.row === parsedAnchor.row
          && Math.abs(parsedSeat.column - parsedAnchor.column) === 1;
        return isNextToAnchor && seat.available && !occupiedIds.has(Number(seat.id));
      })
      .map((seat) => Number(seat.id)),
  );
};

export default function ChatPanel({ match, onClose }) {
  const [messages, setMessages] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [group, setGroup] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const bottomRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const loadMessages = useCallback(async () => {
    const { data } = await getMatchMessages(match.matchId);
    setMessages(data ?? []);
    if (!data || data.length < 50) {
      setHasMoreMessages(false);
    } else {
      setHasMoreMessages(true);
    }
  }, [match.matchId]);

  const loadInvitations = useCallback(async () => {
    const { data } = await getMatchInvitations(match.matchId);
    setInvitations(data ?? []);
  }, [match.matchId]);

  const loadGroup = useCallback(async () => {
    const { data } = await getCineMeetGroupForMatch(match.matchId);
    setGroup(data ?? null);
  }, [match.matchId]);

  const loadConversation = useCallback(async () => {
    await Promise.all([loadMessages(), loadInvitations(), loadGroup()]);
  }, [loadMessages, loadInvitations, loadGroup]);

  const loadOlderMessages = async () => {
    if (messages.length === 0 || busy) return;
    setBusy(true);
    setError("");
    try {
      const firstMessageId = messages[0].id;
      const { data } = await getMatchMessages(match.matchId, firstMessageId);
      if (data && data.length > 0) {
        setMessages((prev) => [...data, ...prev]);
        if (data.length < 50) {
          setHasMoreMessages(false);
        }
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không tải được tin nhắn cũ.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        await loadConversation();
      } catch (err) {
        if (active) setError(err?.response?.data?.message ?? "Không tải được cuộc trò chuyện.");
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();

    const unsubscribe = cineMeetRealtime.subscribe(
      `/topic/cinemeet/matches/${match.matchId}`,
      (event) => {
        if (event?.type === "MATCH_MESSAGE_CREATED" && event.payload) {
          setMessages((previous) =>
            previous.some((message) => message.id === event.payload.id)
              ? previous
              : [...previous, event.payload],
          );
          return;
        }
        if (event?.type?.startsWith("INVITATION_")) {
          loadInvitations().catch(() => {});
          return;
        }
        if (event?.type === "GROUP_CREATED") {
          loadGroup().catch(() => {});
          return;
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadConversation, loadInvitations, loadGroup, match.matchId]);

  useEffect(() => {
    if (!group?.id) return;
    const unsubscribe = cineMeetRealtime.subscribe(
      `/topic/cinemeet/groups/${group.id}`,
      (event) => {
        if (event?.type === "GROUP_UPDATED" && event.payload) {
          setGroup(event.payload);
        }
      }
    );
    return () => unsubscribe();
  }, [group?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, invitations, group]);

  const runAction = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await loadConversation();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể thực hiện thao tác.");
    } finally {
      setBusy(false);
    }
  };

  const runGroupAction = async (action) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await action();
      setGroup(data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể thực hiện thao tác.");
    } finally {
      setBusy(false);
    }
  };

  const openInvitationForm = async () => {
    setError("");
    try {
      const { data } = await getCineMeetShowtimes();
      const upcoming = (data ?? []).filter((item) => new Date(item.startTime) > new Date());
      setShowtimes(upcoming);
      setSelectedShowtimeId(upcoming[0]?.id ?? "");
      setShowInvitationForm(true);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không tải được danh sách suất chiếu.");
    }
  };

  const handleCreateInvitation = () =>
    runAction(async () => {
      if (!selectedShowtimeId) throw new Error("Vui lòng chọn suất chiếu");
      await createMovieInvitation(match.matchId, Number(selectedShowtimeId));
      setShowInvitationForm(false);
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = content.trim();
    if (!text || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await sendMatchMessage(match.matchId, text);
      setMessages((previous) =>
        previous.some((message) => message.id === data.id) ? previous : [...previous, data],
      );
      setContent("");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không gửi được tin nhắn.");
    } finally {
      setBusy(false);
    }
  };

  const pendingInvitation = invitations.find((item) => item.status === "PROPOSED");
  const currentMember = group?.members?.find((member) => Number(member.customerId) === Number(currentUser.id));
  const companionMember = group?.members?.find((member) => Number(member.customerId) !== Number(currentUser.id));
  const seatRows = buildSeatRows(group?.availableSeats);
  const seatOwners = new Map((group?.members ?? [])
    .filter((member) => member.seatId)
    .map((member) => [Number(member.seatId), member]));
  const seatById = new Map((group?.availableSeats ?? []).map((seat) => [Number(seat.id), seat]));
  const anchorSeat = currentMember?.seatId
    ? seatById.get(Number(currentMember.seatId))
    : seatById.get(Number(companionMember?.seatId));
  const recommendedSeatIds = findAdjacentSeatIds(anchorSeat, group?.availableSeats, group?.members);
  const hasSeatRecommendation = recommendedSeatIds.size > 0 && !currentMember?.seatId;
  const displayedMembers = [...(group?.members ?? [])].sort((left, right) => {
    if (Number(left.customerId) === Number(currentUser.id)) return -1;
    if (Number(right.customerId) === Number(currentUser.id)) return 1;
    return 0;
  });
  const timelineItems = [
    ...messages.map((message) => ({
      type: "message",
      id: message.id,
      occurredAt: message.sentAt,
      data: message,
    })),
    ...invitations.map((invitation) => ({
      type: "invitation",
      id: invitation.id,
      occurredAt: invitation.proposedAt,
      data: invitation,
    })),
    ...(group ? [{
      type: "group",
      id: group.id,
      occurredAt: group.createdAt,
      data: group,
    }] : []),
  ].sort((left, right) => {
    const leftTime = new Date(left.occurredAt).getTime();
    const rightTime = new Date(right.occurredAt).getTime();
    return (Number.isNaN(leftTime) ? 0 : leftTime) - (Number.isNaN(rightTime) ? 0 : rightTime);
  });

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/75 p-4" onMouseDown={onClose}>
      <section
        className="flex h-[min(720px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#3a3a3a] bg-[#171717] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[#303030] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-[#2a2a2a]">
              {match.peer?.avatar ? (
                <img src={match.peer.avatar} alt={match.peer.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <h3 className="font-semibold text-white">{match.peer?.name || "Cuộc trò chuyện"}</h3>
              <p className="text-xs text-[#8f8f8f]">Match #{match.matchId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!pendingInvitation && !group ? (
              <button
                type="button"
                onClick={openInvitationForm}
                className="rounded-lg border border-[#e50914]/60 px-3 py-2 text-xs font-semibold text-[#ff7d85] hover:bg-[#e50914]/15"
              >
                Rủ đi xem phim
              </button>
            ) : null}
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-[#b3b3b3] hover:bg-white/10 hover:text-white">
              ✕
            </button>
          </div>
        </header>

        {showInvitationForm ? (
          <div className="border-b border-[#303030] bg-[#202020] p-4">
            <p className="mb-2 text-sm font-semibold text-white">Chọn suất chiếu để gửi lời mời</p>
            <div className="flex gap-2">
              <select
                value={selectedShowtimeId}
                onChange={(event) => setSelectedShowtimeId(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#3a3a3a] bg-[#151515] px-3 py-2 text-sm text-white"
              >
                {showtimes.map((showtime) => (
                  <option key={showtime.id} value={showtime.id}>
                    {showtime.movieTitle} · {showtime.cinemaName} · {formatDateTime(showtime.startTime)}
                  </option>
                ))}
              </select>
              <button disabled={!selectedShowtimeId || busy} onClick={handleCreateInvitation} className="rounded-lg bg-[#e50914] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                Gửi lời mời
              </button>
              <button onClick={() => setShowInvitationForm(false)} className="rounded-lg border border-[#444] px-3 py-2 text-sm text-white">
                Hủy
              </button>
            </div>
            {showtimes.length === 0 ? <p className="mt-2 text-xs text-[#999]">Hiện chưa có suất chiếu khả dụng.</p> : null}
          </div>
        ) : null}

        <div className="cinemeet-scroll flex-1 space-y-3 overflow-y-auto p-4">
          {hasMoreMessages && !loading ? (
            <button
              type="button"
              onClick={loadOlderMessages}
              disabled={busy}
              className="mx-auto block rounded-lg border border-[#3a3a3a] bg-[#222] px-3 py-1.5 text-xs text-white transition hover:bg-[#2d2d2d] disabled:opacity-50"
            >
              Tải tin nhắn cũ hơn
            </button>
          ) : null}
          {loading ? <p className="text-center text-sm text-[#8f8f8f]">Đang tải cuộc trò chuyện...</p> : null}
          {timelineItems.map((item) => {
            if (item.type === "message") {
              const message = item.data;
              const mine = Number(message.senderId) === Number(currentUser.id);
              return (
              <div key={`message-${message.id}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${mine ? "bg-[#e50914] text-white" : "bg-[#292929] text-white"}`}>
                  {!mine ? <p className="mb-1 text-[11px] font-semibold text-[#ff8a91]">{message.senderName}</p> : null}
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/70" : "text-[#8f8f8f]"}`}>
                    {formatDateTime(message.sentAt)}
                  </p>
                </div>
              </div>
              );
            }

            if (item.type === "invitation") {
              const invitation = item.data;
              const mine = Number(invitation.proposerId) === Number(currentUser.id);
              return (
              <div key={`invitation-${invitation.id}`} className="rounded-xl border border-[#5a4520] bg-[#282015] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#ffc83b]">Lời mời xem phim</p>
                    <p className="mt-1 font-semibold text-white">{invitation.movieTitle}</p>
                    <p className="text-xs text-[#c8c8c8]">{invitation.cinemaName} · {invitation.roomName}</p>
                    <p className="text-xs text-[#c8c8c8]">{formatDateTime(invitation.startTime)}</p>
                    <p className="mt-1 text-xs text-[#ffc83b]">{invitationLabels[invitation.status] ?? invitation.status}</p>
                  </div>
                  {invitation.moviePosterUrl ? <img src={invitation.moviePosterUrl} alt="" className="h-20 w-14 rounded object-cover" /> : null}
                </div>
                {invitation.status === "PROPOSED" ? (
                  <div className="mt-3 flex gap-2">
                    {mine ? (
                      <button disabled={busy} onClick={() => runAction(() => cancelMovieInvitation(match.matchId, invitation.id))} className="rounded-lg border border-[#555] px-3 py-1.5 text-xs text-white">
                        Hủy lời mời
                      </button>
                    ) : (
                      <>
                        <button disabled={busy} onClick={() => runAction(() => acceptMovieInvitation(match.matchId, invitation.id))} className="rounded-lg bg-[#e50914] px-3 py-1.5 text-xs font-semibold text-white">
                          Đồng ý
                        </button>
                        <button disabled={busy} onClick={() => runAction(() => rejectMovieInvitation(match.matchId, invitation.id))} className="rounded-lg border border-[#555] px-3 py-1.5 text-xs text-white">
                          Từ chối
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
              );
            }

            if (item.type === "group") {
              const group = item.data;
              return (
            <div className="rounded-xl border border-[#27543a] bg-[#15251c] p-3">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#62d98b]">Nhóm xem phim</p>
                  <p className="mt-1 font-semibold text-white">{group.movieTitle}</p>
                  <p className="text-xs text-[#c8c8c8]">{group.cinemaName} · {group.roomName}</p>
                  <p className="text-xs text-[#c8c8c8]">{formatDateTime(group.startTime)}</p>
                </div>
                <span className="h-fit rounded-full bg-[#21452f] px-2 py-1 text-xs text-[#8cf0ad]">
                  {groupLabels[group.status] ?? group.status}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {displayedMembers.map((member) => (
                  <div key={member.customerId} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-xs">
                    <span className="text-white">
                      {Number(member.customerId) === Number(currentUser.id) ? "Bạn" : member.displayName}
                      {member.seatLabel ? ` · Ghế ${member.seatLabel}` : " · Chưa chọn ghế"}
                    </span>
                    <span className="text-[#8cf0ad]">{member.status}</span>
                  </div>
                ))}
              </div>
              {["WAITING", "PROCESSING"].includes(group.status) ? (
                <div className="mt-3 space-y-3">
                  <div className="cinemeet-seat-picker">
                    <div className="cinemeet-screen">
                      <span>Màn hình</span>
                    </div>
                    <div className="cinemeet-seat-map" aria-label="Sơ đồ chọn ghế">
                      {seatRows.length > 0 ? seatRows.map((row) => (
                        <div className="cinemeet-seat-row" key={row.rowLabel}>
                          <span className="cinemeet-seat-row-label">{row.rowLabel}</span>
                          <div className="cinemeet-seat-row-grid">
                            {row.seats.map((seat) => {
                              const owner = seatOwners.get(Number(seat.id));
                              const isMine = Number(currentMember?.seatId) === Number(seat.id);
                              const isCompanion = owner && !isMine;
                              const isRecommended = hasSeatRecommendation && recommendedSeatIds.has(Number(seat.id));
                              const disabled = busy || (!seat.available && !isMine);
                              return (
                                <button
                                  type="button"
                                  key={seat.id}
                                  disabled={disabled}
                                  title={`${seat.label} - ${seatTypeLabels[seat.seatType] ?? seat.seatType ?? "Ghế"}${
                                    owner ? ` - ${owner.displayName}` : ""
                                  }`}
                                  aria-pressed={isMine}
                                  onClick={() => runGroupAction(() => selectGroupSeat(group.id, Number(seat.id)))}
                                  className={[
                                    "cinemeet-seat",
                                    seat.seatType?.toLowerCase(),
                                    seat.available ? "is-available" : "is-unavailable",
                                    isMine ? "is-mine" : "",
                                    isCompanion ? "is-companion" : "",
                                    isRecommended ? "is-recommended" : "",
                                  ].filter(Boolean).join(" ")}
                                >
                                  <span>{seat.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )) : (
                        <p className="cinemeet-seat-empty">Chưa có sơ đồ ghế cho phòng này.</p>
                      )}
                    </div>
                    {hasSeatRecommendation ? (
                      <p className="cinemeet-seat-hint">
                        Người đi cùng đã chọn ghế {companionMember?.seatLabel}. Các ghế viền sáng là ghế kế bên phù hợp cho bạn.
                      </p>
                    ) : null}
                    <div className="cinemeet-seat-legend">
                      <span><i className="cinemeet-seat-swatch is-available" /> Còn trống</span>
                      <span><i className="cinemeet-seat-swatch is-recommended" /> Nên chọn kế bên</span>
                      <span><i className="cinemeet-seat-swatch is-mine" /> Ghế của bạn</span>
                      <span><i className="cinemeet-seat-swatch is-companion" /> Người đi cùng</span>
                      <span><i className="cinemeet-seat-swatch is-unavailable" /> Đã giữ/đã đặt</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => runGroupAction(() => updateGroupPayment(group.id, "PAID"))} className="rounded-lg bg-[#26834a] px-3 py-1.5 text-xs font-semibold text-white">
                      Xác nhận thanh toán
                    </button>
                    <button disabled={busy} onClick={() => runGroupAction(() => cancelCineMeetGroup(group.id))} className="rounded-lg border border-[#555] px-3 py-1.5 text-xs text-white">
                      Hủy nhóm
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
              );
            }

            return null;
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-[#303030] p-3">
          {error ? <p className="mb-2 text-xs text-red-400">{error}</p> : null}
          <div className="flex gap-2">
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={1000}
              placeholder="Nhập tin nhắn..."
              className="min-w-0 flex-1 rounded-xl border border-[#3a3a3a] bg-[#222] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e50914]"
            />
            <button type="submit" disabled={!content.trim() || busy} className="rounded-xl bg-[#e50914] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff1a26] disabled:opacity-50">
              Gửi
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
