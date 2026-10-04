import React, { useState } from "react";
import supportRequestService from "../../services/supportRequestService";

const SupportPage = () => {

    const [form, setForm] = useState({
        title: "",
        content: "",
        issueType: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!form.title.trim()) {
            setError("Vui lòng nhập tiêu đề yêu cầu.");
            return;
        }

        if (!form.issueType) {
            setError("Vui lòng chọn loại vấn đề.");
            return;
        }

        if (!form.content.trim()) {
            setError("Vui lòng nhập nội dung yêu cầu.");
            return;
        }

        if (form.content.length > 5000) {
            setError(
                "Nội dung yêu cầu không được vượt quá 5000 ký tự."
            );
            return;
        }

        try {

            setLoading(true);

            const response =
                await supportRequestService.create(form);

            if (response.success) {

                setMessage(
                    "Gửi yêu cầu hỗ trợ thành công"
                );

                setForm({
                    title: "",
                    content: "",
                    issueType: ""
                });
            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Gửi yêu cầu hỗ trợ thất bại. Vui lòng thử lại sau."
            );

        } finally {

            setLoading(false);
        }
    };

    const handleCancel = () => {

        setForm({
            title: "",
            content: "",
            issueType: ""
        });

        setMessage("");
        setError("");
    };

    return (
        <div className="support-page">

            <div className="support-container">

                <h2>Gửi yêu cầu hỗ trợ</h2>

                {message && (
                    <div className="alert success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Tiêu đề <span>*</span>
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            maxLength={150}
                            placeholder="Nhập tiêu đề yêu cầu"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Loại vấn đề <span>*</span>
                        </label>

                        <select
                            name="issueType"
                            value={form.issueType}
                            onChange={handleChange}
                        >

                            <option value="">
                                -- Chọn loại vấn đề --
                            </option>

                            <option value="Tài khoản">
                                Tài khoản
                            </option>

                            <option value="Đặt vé">
                                Đặt vé
                            </option>

                            <option value="Thanh toán">
                                Thanh toán
                            </option>

                            <option value="Phim">
                                Phim
                            </option>

                            <option value="Lỗi hệ thống">
                                Lỗi hệ thống
                            </option>

                            <option value="Khác">
                                Khác
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Nội dung yêu cầu <span>*</span>
                        </label>

                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            maxLength={5000}
                            rows={7}
                            placeholder="Mô tả vấn đề bạn đang gặp phải..."
                        />

                        <small>
                            {form.content.length}/5000 ký tự
                        </small>

                    </div>

                    <div className="button-group">

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Đang gửi..."
                                : "Gửi yêu cầu"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default SupportPage;