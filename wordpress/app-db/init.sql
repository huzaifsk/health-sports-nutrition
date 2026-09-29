-- PeakProtein application database (PRD §3, §29-32, §26)
-- Data that belongs to the app itself, not to WooCommerce/WordPress:
-- analytics events, audit logs, notifications, return requests.

CREATE TABLE analytics_events (
    id              BIGSERIAL PRIMARY KEY,
    event_type      TEXT NOT NULL, -- page_view | product_view | add_to_cart | remove_from_cart | checkout_started | payment_started | purchase
    session_id      TEXT NOT NULL,
    customer_email  TEXT,
    product_id      INTEGER,
    product_slug    TEXT,
    order_number    TEXT,
    value           NUMERIC(12, 2),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_events_type ON analytics_events (event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events (created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events (session_id);

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    actor_id        INTEGER NOT NULL,       -- WordPress user id
    actor_name      TEXT NOT NULL,
    action          TEXT NOT NULL,          -- e.g. product.price_changed, order.refunded, role.changed
    entity_type     TEXT NOT NULL,          -- product | order | user | coupon | content | settings
    entity_id       TEXT NOT NULL,
    before_value    JSONB,
    after_value     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    audience        TEXT NOT NULL,          -- 'admin' | 'customer'
    recipient       TEXT,                   -- email, or NULL to broadcast to all staff
    type            TEXT NOT NULL,          -- new_order | low_stock | payment_failed | return_requested | order_confirmation | shipping_update
    title           TEXT NOT NULL,
    body            TEXT,
    read_at         TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_audience ON notifications (audience, read_at);
CREATE INDEX idx_notifications_recipient ON notifications (recipient);

CREATE TABLE return_requests (
    id              BIGSERIAL PRIMARY KEY,
    order_number    TEXT NOT NULL,
    customer_email  TEXT NOT NULL,
    product_id      INTEGER NOT NULL,
    product_name    TEXT NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    reason          TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | received | refunded
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_return_requests_order ON return_requests (order_number);
CREATE INDEX idx_return_requests_status ON return_requests (status);
