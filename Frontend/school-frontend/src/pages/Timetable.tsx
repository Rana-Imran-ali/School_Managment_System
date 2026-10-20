import React, { useState } from 'react';
import { Plus, Printer } from 'lucide-react';
import type { TimetableSlot } from '../types';
import {
  initialTimetable,
  initialPeriods,
  initialSubjects,
  initialTeachers,
  initialClasses,
  initialSections,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { Modal } from '../components/Modal';
import { timetableService } from '../api/timetableService';
import { useAuth } from '../context/AuthContext';

export const Timetable: React.FC = () => {
  const { currentRole } = useAuth();
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() =>
    getStoredData('timetable_data', initialTimetable)
  );

  const [selectedClass, setSelectedClass] = useState<number>(2); // Grade 10
  const [selectedSection, setSelectedSection] = useState<number>(3); // Sec A
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Load live timetable slots from backend
  React.useEffect(() => {
    let isMounted = true;
    timetableService
      .getTimetables({
        class_id: selectedClass,
        section_id: selectedSection,
      })
      .then((slots) => {
        if (isMounted && slots && slots.length > 0) {
          setTimetable((prev) => {
            const others = prev.filter(
              (s) => s.school_class_id !== selectedClass || s.section_id !== selectedSection
            );
            return [...others, ...slots];
          });
        }
      })
      .catch((err) => {
        console.warn('Backend timetable fetch error, using local data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedClass, selectedSection]);

  const [slotForm, setSlotForm] = useState({
    day_of_week: 'monday' as TimetableSlot['day_of_week'],
    period_id: 1,
    subject_id: 1,
    teacher_profile_id: 1,
    room_number: 'Lab 301',
  });

  const days: { key: TimetableSlot['day_of_week']; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
  ];

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      school_class_id: selectedClass,
      section_id: selectedSection,
      period_id: Number(slotForm.period_id),
      day_of_week: slotForm.day_of_week,
      subject_id: Number(slotForm.subject_id),
      teacher_profile_id: Number(slotForm.teacher_profile_id),
      room_number: slotForm.room_number,
    };

    try {
      const serverSlot = await timetableService.createTimetable(payload);
      const newSlot: TimetableSlot = serverSlot || {
        id: Date.now(),
        ...payload,
      };

      const updated = [
        ...timetable.filter(
          (s) =>
            !(
              s.school_class_id === selectedClass &&
              s.section_id === selectedSection &&
              s.day_of_week === slotForm.day_of_week &&
              s.period_id === Number(slotForm.period_id)
            )
        ),
        newSlot,
      ];

      setTimetable(updated);
      saveStoredData('timetable_data', updated);
      setIsSlotModalOpen(false);
    } catch (err: any) {
      console.warn('Backend timetable save error, saving locally:', err);
      const newSlot: TimetableSlot = {
        id: Date.now(),
        ...payload,
      };
      const updated = [
        ...timetable.filter(
          (s) =>
            !(
              s.school_class_id === selectedClass &&
              s.section_id === selectedSection &&
              s.day_of_week === slotForm.day_of_week &&
              s.period_id === Number(slotForm.period_id)
            )
        ),
        newSlot,
      ];
      setTimetable(updated);
      saveStoredData('timetable_data', updated);
      setIsSlotModalOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="timetable-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Academic Schedule & Timetable</h1>
          <p className="page-subtitle">
            Weekly matrix scheduling, period room assignments, and conflict-free timetable management.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Timetable
          </button>
          {currentRole === 'admin' && (
            <button className="btn btn-primary" onClick={() => setIsSlotModalOpen(true)}>
              <Plus size={16} /> Schedule Period Slot
            </button>
          )}
        </div>
      </div>

      {/* Class & Section Selection Filter */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Class:</span>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {initialClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Section:</span>
            <select
              className="form-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {initialSections
                .filter((s) => s.school_class_id === selectedClass)
                .map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly Timetable Matrix Grid */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.25rem' }}>
        <div className="timetable-grid">
          {/* Header Row */}
          <div className="timetable-header-cell">Time / Period</div>
          {days.map((day) => (
            <div key={day.key} className="timetable-header-cell">
              {day.label}
            </div>
          ))}

          {/* Periods Rows */}
          {initialPeriods.map((period) => (
            <React.Fragment key={period.id}>
              {/* Period Column */}
              <div
                className="timetable-period-cell"
                style={period.is_break ? { background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)' } : {}}
              >
                <strong style={{ color: period.is_break ? 'var(--warning)' : 'var(--text-main)' }}>
                  {period.name}
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '0.2rem' }}>
                  {period.start_time} - {period.end_time}
                </span>
              </div>

              {/* Day Cells for this Period */}
              {days.map((day) => {
                if (period.is_break) {
                  return (
                    <div
                      key={day.key}
                      style={{
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px dashed rgba(245, 158, 11, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--warning)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {period.name}
                    </div>
                  );
                }

                const slot = timetable.find(
                  (s) =>
                    s.school_class_id === selectedClass &&
                    s.section_id === selectedSection &&
                    s.day_of_week === day.key &&
                    s.period_id === period.id
                );

                const subject = slot ? initialSubjects.find((sub) => sub.id === slot.subject_id) : null;
                const teacher = slot ? initialTeachers.find((t) => t.id === slot.teacher_profile_id) : null;

                return (
                  <div key={day.key}>
                    {slot && subject ? (
                      <div className="timetable-slot">
                        <div className="slot-subject">{subject.name}</div>
                        <div className="slot-teacher">{teacher?.user?.name || 'Faculty Staff'}</div>
                        {slot.room_number && <div className="slot-room">{slot.room_number}</div>}
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '85px',
                          border: '1px dashed var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-faint)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSlotForm({
                            ...slotForm,
                            day_of_week: day.key,
                            period_id: period.id,
                          });
                          setIsSlotModalOpen(true);
                        }}
                      >
                        + Add Lecture
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Schedule Slot Modal */}
      <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)} title="Schedule Academic Lecture">
        <form onSubmit={handleSaveSlot}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day of Week *</label>
              <select
                className="form-select"
                value={slotForm.day_of_week}
                onChange={(e) => setSlotForm({ ...slotForm, day_of_week: e.target.value as any })}
              >
                {days.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lecture Period *</label>
              <select
                className="form-select"
                value={slotForm.period_id}
                onChange={(e) => setSlotForm({ ...slotForm, period_id: Number(e.target.value) })}
              >
                {initialPeriods
                  .filter((p) => !p.is_break)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.start_time} - {p.end_time})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select
                className="form-select"
                value={slotForm.subject_id}
                onChange={(e) => setSlotForm({ ...slotForm, subject_id: Number(e.target.value) })}
              >
                {initialSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Instructor / Teacher *</label>
              <select
                className="form-select"
                value={slotForm.teacher_profile_id}
                onChange={(e) => setSlotForm({ ...slotForm, teacher_profile_id: Number(e.target.value) })}
              >
                {initialTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Room / Lab Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lab 301 or Room 204"
              value={slotForm.room_number}
              onChange={(e) => setSlotForm({ ...slotForm, room_number: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign to Timetable
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
