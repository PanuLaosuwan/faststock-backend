CREATE TABLE IF NOT EXISTS users (
    uid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    uname VARCHAR(100) NOT NULL,
    pos VARCHAR(50),
    "desc" TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, password, uname, pos, "desc")
VALUES
    ('yutha', '$2a$10$MsTGfCWgNjhLRaUhrIFNLu67DERaS9LC8buvBQGmsO7Yb2V.6koY2', 'Yutha Suwannadech', 'superadmin', 'ผู้ดูแลระบบหลัก'),
    ('alice', '$2a$10$L70NN5dJNGTqYS0ZKJoueuZIdgMCNfA2R5ZVEKZ/o0wiBsSJVG9jS', 'Alice Johnson', 'Analyst', 'คนดูแลระบบ'),
    ('bob', '$2a$10$cnJLMc2bOKYolxUovyD1B.EwQ/Z26e/qsK50ZnsOFGEBNi42a33nO', 'Bob Smith', 'Advisor', 'ดูข้อมูลการใช้งาน')
ON CONFLICT (username) DO NOTHING;
