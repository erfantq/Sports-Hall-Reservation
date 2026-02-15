import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Form, Row, Col, Table, Badge, Spinner, Alert, Pagination } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./UsersAdmin.css";

import UserFormModal from "../../components/admin/UserFormModal";
import ConfirmModal from "../../components/admin/ConfirmModal";

const ANIM_MS = 180;

export default function UsersAdmin() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingUser, setEditingUser] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const [active, setActive] = useState("All");

  const abortRef = useRef(null);

  const goToPage = (nextPage) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    if (clamped === page) return;

    setDirection(clamped > page ? "next" : "prev");
    setIsAnimating(true);

    window.setTimeout(() => {
      setPage(clamped);
      setIsAnimating(false);
    }, ANIM_MS);
  };

  useEffect(() => {
    // reset to page 1 when filters change
    if (page !== 1) goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, role]);

  const load = async () => {
    setError("");
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = await fetchUsers({
        page,
        page_size: pageSize,
        search: query,
        role,
        active,
      });

      if (!payload?.status) throw new Error(payload?.message || "Request failed.");

      setItems(payload.data.items || []);
      setTotalPages(payload.data.total_pages || 1);

      if (page > (payload.data.total_pages || 1)) setPage(payload.data.total_pages || 1);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load users.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, role]);

  const roleBadge = (r) => {
    if (r === "admin") return <Badge className="role-badge role-admin">Admin</Badge>;
    if (r === "venue_manager") return <Badge className="role-badge role-vm">Venue manager</Badge>;
    return <Badge className="role-badge role-user">User</Badge>;
  };

  const fetchUsers = async (params) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params,
    });
    return await res.json();
  };

  const openCreate = () => {
    setFormMode("create");
    setEditingUser(null);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setFormMode("edit");
    setEditingUser(u);
    setShowForm(true);
  };

  const submitUser = async (data) => {
    setMutating(true);
    setError("");
    try {
      if (formMode === "create") {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/create/`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(data),
        });
        const payload = await res.json();
        if (!payload?.status) throw new Error(payload?.message || "Create failed.");
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/update/${editingUser.id}`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(data),
        });
        const payload = await res.json();
        if (!payload?.status) throw new Error(payload?.message || "Update failed.");
      }

      setShowForm(false);
      await load();
    } catch (e) {
      setError(e?.message || "Operation failed.");
    } finally {
      setMutating(false);
    }
  };

  const askDelete = (u) => {
    setDeletingUser(u);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setMutating(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/delete/${deletingUser.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const payload = await res.json();
      if (!payload?.status) throw new Error(payload?.message || "Delete failed.");
      setShowDelete(false);
      setDeletingUser(null);

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch (e) {
      setError(e?.message || "Delete failed.");
    } finally {
      setMutating(false);
    }
  };

  const paginationItems = useMemo(() => {
    const nodes = [];
    const add = (p) =>
      nodes.push(
        <Pagination.Item
          key={p}
          active={p === page}
          onClick={() => goToPage(p)}
          disabled={loading || isAnimating}
        >
          {p}
        </Pagination.Item>
      );

    nodes.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1 || loading || isAnimating}
        onClick={() => goToPage(page - 1)}
      />
    );

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) add(p);
    } else {
      add(1);
      if (page > 3) nodes.push(<Pagination.Ellipsis key="e1" disabled />);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let p = start; p <= end; p++) add(p);
      if (page < totalPages - 2) nodes.push(<Pagination.Ellipsis key="e2" disabled />);
      add(totalPages);
    }

    nodes.push(
      <Pagination.Next
        key="next"
        disabled={page === totalPages || loading || isAnimating}
        onClick={() => goToPage(page + 1)}
      />
    );

    return nodes;
  }, [page, totalPages, loading, isAnimating]);

  return (
    <div>
      <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h1 className="text-white mb-1" style={{ fontWeight: 900 }}>Users</h1>
          <div className="muted">Add, edit, delete users and set roles.</div>
        </div>

        <Button className="btn-white-glass" onClick={openCreate} disabled={loading || mutating}>
          <FaPlus style={{ marginRight: 8 }} />
          Add user
        </Button>
      </div>

      <Card className="glass-card">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Label className="form-label-dark">Search</Form.Label>
              <Form.Control
                className="dark-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username or email..."
                disabled={loading || mutating}
              />
            </Col>

            <Col md={4}>
              <Form.Label className="form-label-dark">Role</Form.Label>
              <Form.Select
                className="dark-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading || mutating}
              >
                <option value="All">All</option>
                <option value="user">User</option>
                <option value="venue_manager">Venue manager</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="form-label-dark">Status</Form.Label>
              <Form.Select className="dark-input" value={active} onChange={(e) => setActive(e.target.value)} disabled={loading || mutating}>
                <option value="All">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
          </Row>

          {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}

          <div className="admin-table-wrap mt-3">
            <Table responsive className={`admin-table ${isAnimating ? `is-animating ${direction}` : ""}`}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" role="status" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="text-center muted py-4">No users found.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr key={u.id}>
                      <td className="text-white fw-semibold">{u.username}</td>
                      <td className="muted">{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>
                        <Badge className={`status-badge ${u.is_active ? "ok" : "off"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="muted">{u.created_at}</td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Button
                            variant="outline-light"
                            className="icon-btn"
                            onClick={() => openEdit(u)}
                            disabled={mutating}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-light"
                            className="icon-btn danger"
                            onClick={() => askDelete(u)}
                            disabled={mutating}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Pagination className="venues-pagination">{paginationItems}</Pagination>
          </div>
        </Card.Body>
      </Card>

      <UserFormModal
        show={showForm}
        mode={formMode}
        initialUser={editingUser}
        loading={mutating}
        onClose={() => setShowForm(false)}
        onSubmit={submitUser}
      />

      <ConfirmModal
        show={showDelete}
        title="Delete user"
        body={`Are you sure you want to delete "${deletingUser?.username}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={mutating}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
