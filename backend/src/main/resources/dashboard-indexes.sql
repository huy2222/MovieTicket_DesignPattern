-- Recommended indexes for admin dashboard queries (run manually if not exists)

-- Payments: revenue aggregation by paid date and status
CREATE INDEX IF NOT EXISTS idx_payments_status_paid_at ON payments (status, paid_at);

-- Bookings: count confirmed bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status_booking_date ON bookings (status, booking_date);

-- Tickets: ticket sales by issue date
CREATE INDEX IF NOT EXISTS idx_tickets_issued_at ON tickets (issued_at);

-- Showtimes: count today's showtimes
CREATE INDEX IF NOT EXISTS idx_showtimes_start_time ON showtimes (start_time);

-- Users: employee search by role/status
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
