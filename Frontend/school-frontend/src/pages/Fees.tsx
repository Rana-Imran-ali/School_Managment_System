import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Printer,
  Eye,
  Clock,
  Layers,
} from 'lucide-react';
import type { FeePayment, FeeStructure, FeeType } from '../types';
import {
  initialFeePayments,
  initialFeeStructures,
  initialFeeTypes,
  initialStudents,
  initialClasses,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { feeService } from '../api/feeService';
import { useAuth } from '../context/AuthContext';

export const Fees: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'structures'>('payments');

  const [payments, setPayments] = useState<FeePayment[]>(() =>
    getStoredData('fee_payments_list', initialFeePayments)
  );
  const [structures, setStructures] = useState<FeeStructure[]>(() =>
    getStoredData('fee_structures_list', initialFeeStructures)
  );
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(() =>
    getStoredData('fee_types_list', initialFeeTypes)
  );

  // Load live fee data from backend
  React.useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      feeService.getFeePayments(),
      feeService.getFeeStructures(),
      feeService.getFeeTypes(),
    ]).then(([payRes, structRes, typeRes]) => {
      if (!isMounted) return;

      if (payRes.status === 'fulfilled' && payRes.value?.items && payRes.value.items.length > 0) {
        setPayments(payRes.value.items);
        saveStoredData('fee_payments_list', payRes.value.items);
      }
      if (structRes.status === 'fulfilled' && structRes.value && structRes.value.length > 0) {
        setStructures(structRes.value);
        saveStoredData('fee_structures_list', structRes.value);
      }
      if (typeRes.status === 'fulfilled' && typeRes.value && typeRes.value.length > 0) {
        setFeeTypes(typeRes.value);
        saveStoredData('fee_types_list', typeRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  // Collect Payment Form
  const [collectForm, setCollectForm] = useState({
    student_profile_id: 1,
    fee_type_id: 1,
    amount_paid: 2400.0,
    payment_method: 'online' as FeePayment['payment_method'],
    transaction_id: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: 'paid' as FeePayment['status'],
    receipt_number: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    remarks: 'Full payment received',
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment: FeePayment = {
      id: Date.now(),
      student_profile_id: Number(collectForm.student_profile_id),
      fee_type_id: Number(collectForm.fee_type_id),
      amount_paid: Number(collectForm.amount_paid),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: collectForm.payment_method,
      transaction_id: collectForm.transaction_id,
      status: collectForm.status,
      receipt_number: collectForm.receipt_number,
      remarks: collectForm.remarks,
      recorded_by: 1,
    };

    const updated = [newPayment, ...payments];
    setPayments(updated);
    saveStoredData('fee_payments_list', updated);
    setIsCollectModalOpen(false);
  };

  const totalCollected = payments
    .filter((p) => p.status === 'paid' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const filteredPayments = payments.filter((p) => {
    const student = initialStudents.find((s) => s.id === p.student_profile_id);
    const matchesSearch =
      p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="fees-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tuition & Financial Management</h1>
          <p className="page-subtitle">
            Fee structure configuration, payment collection terminal, and print-ready digital receipts.
          </p>
        </div>
        {currentRole === 'admin' && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setIsCollectModalOpen(true)}>
              <Plus size={16} /> Record Payment
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Revenue Collected</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            ${totalCollected.toLocaleString()}
          </div>
          <div className="stat-trend trend-up">All active transactions reconciled</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Verified Receipts</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <CreditCard size={22} />
            </div>
          </div>
          <div className="stat-value">{payments.length}</div>
          <div className="stat-trend">Issued digital vouchers</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Pending Invoices</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-value">{payments.filter((p) => p.status === 'pending').length}</div>
          <div className="stat-trend" style={{ color: 'var(--warning)' }}>Awaiting guardian transfer</div>
        </div>
      </div>

      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} /> {currentRole === 'parent' ? "My Child's Invoices & Receipts" : 'Transaction Ledger'}
        </button>
        {currentRole === 'admin' && (
          <button
            className={`tab-btn ${activeTab === 'structures' ? 'active' : ''}`}
            onClick={() => setActiveTab('structures')}
          >
            <Layers size={16} /> Class Fee Schedules
          </button>
        )}
      </div>

      {/* TAB 1: Payment Transactions */}
      {activeTab === 'payments' && (
        <div>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by receipt no, student name, or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Transactions</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Voucher</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const student = initialStudents.find((s) => s.id === p.student_profile_id);
                  const feeType = feeTypes.find((f) => f.id === p.fee_type_id);

                  return (
                    <tr key={p.id}>
                      <td>
                        <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                          {p.receipt_number}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{student?.user?.name || 'Student'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {student?.admission_number}
                        </div>
                      </td>
                      <td>{feeType?.name || 'Tuition Fee'}</td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>${p.amount_paid.toLocaleString()}</strong>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.payment_date}</td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                          {p.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReceipt(p)}
                          title="View Official Receipt"
                        >
                          <Eye size={14} /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Fee Structures */}
      {activeTab === 'structures' && (
        <div className="glass-panel" style={{ padding: '0.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Grade / Class</th>
                <th>Fee Category</th>
                <th>Required Tariff</th>
                <th>Payment Due Date</th>
                <th>Academic Session</th>
              </tr>
            </thead>
            <tbody>
              {structures.map((str) => {
                const cls = initialClasses.find((c) => c.id === str.school_class_id);
                const type = feeTypes.find((t) => t.id === str.fee_type_id);
                return (
                  <tr key={str.id}>
                    <td style={{ fontWeight: 700 }}>{cls?.name || 'Grade 10'}</td>
                    <td>{type?.name || 'Tuition Fee'}</td>
                    <td><strong style={{ color: 'var(--success)' }}>${str.amount.toFixed(2)}</strong></td>
                    <td>{str.due_date}</td>
                    <td>2025-2026</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={isCollectModalOpen} onClose={() => setIsCollectModalOpen(false)} title="Record Fee Transaction">
        <form onSubmit={handleRecordPayment}>
          <div className="form-group">
            <label className="form-label">Student Recipient *</label>
            <select
              className="form-select"
              value={collectForm.student_profile_id}
              onChange={(e) => setCollectForm({ ...collectForm, student_profile_id: Number(e.target.value) })}
            >
              {initialStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user?.name} ({st.admission_number})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fee Category *</label>
              <select
                className="form-select"
                value={collectForm.fee_type_id}
                onChange={(e) => setCollectForm({ ...collectForm, fee_type_id: Number(e.target.value) })}
              >
                {feeTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paid ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                value={collectForm.amount_paid}
                onChange={(e) => setCollectForm({ ...collectForm, amount_paid: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                className="form-select"
                value={collectForm.payment_method}
                onChange={(e) => setCollectForm({ ...collectForm, payment_method: e.target.value as any })}
              >
                <option value="online">Online Gateway (Stripe/Card)</option>
                <option value="card">Point of Sale (Terminal)</option>
                <option value="cash">Cash Tendered</option>
                <option value="bank_transfer">Wire / Direct Bank</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={collectForm.status}
                onChange={(e) => setCollectForm({ ...collectForm, status: e.target.value as any })}
              >
                <option value="paid">Fully Paid</option>
                <option value="partial">Partial Payment</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Receipt Number *</label>
              <input
                type="text"
                required
                className="form-input"
                value={collectForm.receipt_number}
                onChange={(e) => setCollectForm({ ...collectForm, receipt_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transaction Reference</label>
              <input
                type="text"
                className="form-input"
                value={collectForm.transaction_id}
                onChange={(e) => setCollectForm({ ...collectForm, transaction_id: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Auditor Remarks</label>
            <input
              type="text"
              className="form-input"
              value={collectForm.remarks}
              onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Voucher: ${selectedReceipt.receipt_number}`}
          maxWidth="680px"
        >
          {(() => {
            const student = initialStudents.find((s) => s.id === selectedReceipt.student_profile_id);
            const feeType = feeTypes.find((f) => f.id === selectedReceipt.fee_type_id);

            return (
              <div>
                <div className="receipt-paper" style={{ padding: '1.75rem' }}>
                  <div className="receipt-header">
                    <div style={{ fontSize: '0.78rem', letterSpacing: '0.1em', fontWeight: 800, color: '#6366f1' }}>
                      EDUCORE ACADEMY FINANCIAL SERVICES
                    </div>
                    <h2 className="receipt-title">FEE PAYMENT RECEIPT</h2>
                    <div className="receipt-sub">Receipt No: {selectedReceipt.receipt_number}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.85rem', margin: '1rem 0' }}>
                    <div><strong>Student:</strong> {student?.user?.name}</div>
                    <div><strong>Admission No:</strong> {student?.admission_number}</div>
                    <div><strong>Class:</strong> Grade 10 - Section A</div>
                    <div><strong>Payment Date:</strong> {selectedReceipt.payment_date}</div>
                    <div><strong>Payment Method:</strong> {selectedReceipt.payment_method.toUpperCase()}</div>
                    <div><strong>Reference:</strong> {selectedReceipt.transaction_id || 'N/A'}</div>
                  </div>

                  <table className="receipt-details-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Item Description</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'left' }}>{feeType?.name || 'Tuition Fee'} (Term 1)</td>
                        <td style={{ textAlign: 'right' }}><strong>${selectedReceipt.amount_paid.toFixed(2)}</strong></td>
                      </tr>
                      <tr className="receipt-total-row">
                        <td style={{ textAlign: 'left' }}>TOTAL SETTLED:</td>
                        <td style={{ textAlign: 'right', color: '#10b981' }}>
                          ${selectedReceipt.amount_paid.toFixed(2)} USD
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Status: <strong style={{ color: '#10b981' }}>VERIFIED & CLEARED</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #334155', width: '130px', marginBottom: '0.25rem' }}></div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized Cashier</div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)}>
                    Close
                  </button>
                  <button className="btn btn-primary" onClick={() => window.print()}>
                    <Printer size={16} /> Print Voucher
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
