-- Reduce privilegios de DDL/DML estructural para clientes autenticados.
-- La app conserva SELECT/INSERT/UPDATE/DELETE; RLS sigue siendo la capa de autorización por fila.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM authenticated;
