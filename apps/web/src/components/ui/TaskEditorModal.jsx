import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { supabase } from '@schedulepro/shared/src/lib/supabase';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CATEGORIES = [
  { value: 'work', label: 'Work', color: 'var(--color-work)' },
  { value: 'coding', label: 'Coding', color: 'var(--color-health)' },
  { value: 'spirituality', label: 'Spirituality', color: 'var(--color-personal)' },
  { value: 'health', label: 'Health', color: 'var(--color-success)' },
  { value: 'languages', label: 'Languages', color: 'var(--color-learning)' },
  { value: 'literature', label: 'Literature', color: 'var(--color-creative)' },
  { value: 'leadership', label: 'Leadership', color: 'var(--color-accent)' },
  { value: 'meals', label: 'Meals', color: 'var(--color-warning)' },
  { value: 'chores', label: 'Chores', color: 'var(--color-destructive)' },
  { value: 'leisure', label: 'Leisure', color: 'var(--color-secondary)' },
  { value: 'family', label: 'Family', color: 'var(--color-family)' },
  { value: 'social', label: 'Social', color: 'var(--color-social)' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

const DURATION_PRESETS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];

const RECURRENCE_TYPES = [
  { value: '', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
  { value: 'weekly', label: 'Weekly (same day)' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
  { value: 'custom', label: 'Custom days…' },
];

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MIN_DURATION = 5;
const MAX_DURATION = 720;

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr?.split(':')?.map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const clamped = Math.max(0, Math.min(1439, totalMinutes));
  const h = Math.floor(clamped / 60)?.toString()?.padStart(2, '0');
  const m = (clamped % 60)?.toString()?.padStart(2, '0');
  return `${h}:${m}`;
}

function formatDurationDisplay(minutes) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024)?.toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024))?.toFixed(1)} MB`;
}

// ─── File validation constants ────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];
const ALLOWED_EXTENSIONS = ['jpg','jpeg','png','gif','webp','svg','pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv'];

function getFileTypeBadge(fileType, attachmentType) {
  if (attachmentType === 'email') return { label: 'Email', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' };
  if (!fileType) return { label: 'File', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
  if (fileType?.startsWith('image/')) return { label: 'Image', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' };
  if (fileType === 'application/pdf') return { label: 'PDF', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' };
  if (fileType?.includes('word') || fileType === 'application/msword') return { label: 'Word', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' };
  if (fileType?.includes('excel') || fileType?.includes('spreadsheet') || fileType === 'application/vnd.ms-excel') return { label: 'Excel', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' };
  if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return { label: 'PPT', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' };
  if (fileType === 'text/plain') return { label: 'Text', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
  if (fileType === 'text/csv') return { label: 'CSV', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' };
  return { label: 'File', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
}

function formatUploadDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

const defaultFormState = {
  title: '',
  category: '',
  date: '',
  startTime: '',
  endTime: '',
  duration: 60,
  priority: 'medium',
  notes: '',
  recurrenceType: '',
  recurrenceDays: [],
};

// ─── Attachment Viewer ────────────────────────────────────────────────────────
const AttachmentViewer = ({ attachment, onClose }) => {
  const isImage = attachment?.file_type?.startsWith('image/');
  const isPdf = attachment?.file_type === 'application/pdf';
  const isEmail = attachment?.attachment_type === 'email';
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (attachment?.storage_path && !isEmail) {
      supabase?.storage?.from('task-attachments')?.createSignedUrl(attachment?.storage_path, 3600)
        ?.then(({ data }) => setUrl(data?.signedUrl));
    }
  }, [attachment, isEmail]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-xl overflow-hidden bg-[var(--color-card)] flex flex-col"
        onClick={(e) => e?.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name={isEmail ? 'Mail' : isPdf ? 'FileText' : isImage ? 'Image' : 'Paperclip'} size={16} color="var(--color-primary)" />
            <span className="font-caption text-sm font-medium text-[var(--color-foreground)] truncate">{attachment?.file_name}</span>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-muted)] transition-smooth">
            <Icon name="X" size={16} color="var(--color-muted-foreground)" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isEmail ? (
            <div className="flex flex-col gap-3">
              {attachment?.email_from && (
                <div className="flex gap-2">
                  <span className="font-caption text-xs font-semibold text-[var(--color-muted-foreground)] w-12 flex-shrink-0">From:</span>
                  <span className="font-body text-sm text-[var(--color-foreground)]">{attachment?.email_from}</span>
                </div>
              )}
              {attachment?.email_subject && (
                <div className="flex gap-2">
                  <span className="font-caption text-xs font-semibold text-[var(--color-muted-foreground)] w-12 flex-shrink-0">Subject:</span>
                  <span className="font-body text-sm font-semibold text-[var(--color-foreground)]">{attachment?.email_subject}</span>
                </div>
              )}
              <div className="border-t border-[var(--color-border)] pt-3">
                <p className="font-body text-sm text-[var(--color-foreground)] whitespace-pre-wrap">{attachment?.email_body || 'No content'}</p>
              </div>
            </div>
          ) : isImage && url ? (
            <img src={url} alt={attachment?.file_name} className="max-w-full max-h-full object-contain mx-auto rounded-lg" />
          ) : isPdf && url ? (
            <iframe src={url} title={attachment?.file_name} className="w-full h-96 rounded-lg border border-[var(--color-border)]" />
          ) : url ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center">
                <Icon name="File" size={32} color="var(--color-muted-foreground)" />
              </div>
              <p className="font-body text-sm text-[var(--color-muted-foreground)]">{attachment?.file_name}</p>
              <a href={url} download={attachment?.file_name} className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-caption text-sm font-medium hover:opacity-90 transition-smooth">
                Download File
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Email Input Dialog ───────────────────────────────────────────────────────
const EmailInputDialog = ({ onSave, onClose }) => {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden"
        onClick={(e) => e?.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={16} color="var(--color-primary)" />
            <span className="font-heading text-sm font-semibold text-[var(--color-foreground)]">Attach Email</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-muted)] transition-smooth">
            <Icon name="X" size={16} color="var(--color-muted-foreground)" />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)]">From</label>
            <input value={from} onChange={(e) => setFrom(e?.target?.value)} placeholder="sender@example.com" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none focus:border-[var(--color-primary)] transition-smooth" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)]">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e?.target?.value)} placeholder="Email subject" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none focus:border-[var(--color-primary)] transition-smooth" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-caption text-xs font-medium text-[var(--color-muted-foreground)]">Body</label>
            <textarea value={body} onChange={(e) => setBody(e?.target?.value)} placeholder="Paste email content here…" rows={5} className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] font-body text-sm text-[var(--color-foreground)] bg-[var(--color-muted)] outline-none focus:border-[var(--color-primary)] transition-smooth resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] font-caption text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-smooth">Cancel</button>
            <button
              onClick={() => { if (subject || body) { onSave({ from, subject, body }); } }}
              disabled={!subject && !body}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-caption text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
            >Attach</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const TaskEditorModal = ({ isOpen = false, onClose, editingTask = null, onSave, onDelete, suggestedStartTime = null }) => {
  const [form, setForm] = useState(defaultFormState);
  const [errors, setErrors] = useState({});
  const [durationError, setDurationError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const fileInputRef = useRef(null);

  const isEditing = Boolean(editingTask);

  useEffect(() => {
    supabase?.auth?.getUser()?.then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        let dateVal = editingTask?.date || '';
        if (!dateVal && editingTask?.day) {
          const today = new Date();
          const todayDow = today?.getDay();
          const targetDow = DAYS?.indexOf(editingTask?.day);
          if (targetDow >= 0) {
            const diff = targetDow - todayDow;
            const target = new Date(today);
            target?.setDate(today?.getDate() + diff);
            dateVal = target?.toISOString()?.split('T')?.[0];
          }
        }
        const dur = editingTask?.duration || 60;
        const startTime = editingTask?.startTime || '';
        const endTime = editingTask?.endTime || (startTime ? minutesToTime(timeToMinutes(startTime) + dur) : '');
        setForm({
          title: editingTask?.title || '',
          category: editingTask?.category || '',
          date: dateVal,
          startTime,
          endTime,
          duration: dur,
          priority: editingTask?.priority || 'medium',
          notes: editingTask?.notes || '',
          recurrenceType: editingTask?.recurrenceType || '',
          recurrenceDays: editingTask?.recurrenceDays || [],
        });
        // Load existing attachments
        if (editingTask?.id) loadAttachments(editingTask?.id);
      } else {
        const today = new Date()?.toISOString()?.split('T')?.[0];
        const startTime = suggestedStartTime || '';
        const endTime = startTime ? minutesToTime(timeToMinutes(startTime) + 60) : '';
        setForm({ ...defaultFormState, date: today, startTime, endTime });
        setAttachments([]);
      }
      setErrors({});
      setDurationError('');
      setIsDeleting(false);
      setTimeout(() => firstFocusableRef?.current?.focus(), 50);
    }
  }, [isOpen, editingTask, suggestedStartTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e?.key === 'Escape' && isOpen) onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const loadAttachments = async (taskId) => {
    setLoadingAttachments(true);
    try {
      const { data, error } = await supabase
        ?.from('task_attachments')
        ?.select('*')
        ?.eq('task_id', taskId)
        ?.order('created_at', { ascending: true });
      if (!error && data) setAttachments(data);
    } catch {}
    finally { setLoadingAttachments(false); }
  };

  const handleBackdropClick = useCallback((e) => {
    if (e?.target === e?.currentTarget) onClose?.();
  }, [onClose]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // When startTime changes: keep duration, update endTime
  const handleStartTimeChange = (newStart) => {
    const startMins = timeToMinutes(newStart);
    const dur = form?.duration || 60;
    const endMins = startMins + dur;
    const newEnd = minutesToTime(endMins);
    setForm(prev => ({ ...prev, startTime: newStart, endTime: newEnd }));
    if (errors?.startTime) setErrors(prev => ({ ...prev, startTime: '' }));
  };

  // When endTime changes: recalculate duration
  const handleEndTimeChange = (newEnd) => {
    const startMins = timeToMinutes(form?.startTime);
    const endMins = timeToMinutes(newEnd);
    const newDur = endMins - startMins;
    if (form?.startTime && newDur >= MIN_DURATION && newDur <= MAX_DURATION) {
      setForm(prev => ({ ...prev, endTime: newEnd, duration: newDur }));
      setDurationError('');
    } else if (form?.startTime && newDur < MIN_DURATION) {
      setForm(prev => ({ ...prev, endTime: newEnd }));
      setDurationError(`Minimum duration is ${MIN_DURATION} minutes`);
    } else if (form?.startTime && newDur > MAX_DURATION) {
      setForm(prev => ({ ...prev, endTime: newEnd }));
      setDurationError('Maximum duration is 12 hours');
    } else {
      setForm(prev => ({ ...prev, endTime: newEnd }));
    }
  };

  // When duration input changes manually
  const handleDurationChange = (rawVal) => {
    const val = parseInt(rawVal, 10);
    if (isNaN(val)) {
      setForm(prev => ({ ...prev, duration: rawVal }));
      return;
    }
    if (val < MIN_DURATION) {
      setDurationError(`Minimum duration is ${MIN_DURATION} minutes`);
    } else if (val > MAX_DURATION) {
      setDurationError('Maximum duration is 12 hours');
    } else {
      setDurationError('');
    }
    const clampedVal = Math.max(MIN_DURATION, Math.min(MAX_DURATION, val));
    const newEnd = form?.startTime ? minutesToTime(timeToMinutes(form?.startTime) + clampedVal) : form?.endTime;
    setForm(prev => ({ ...prev, duration: val, endTime: newEnd }));
  };

  // When preset button clicked
  const handlePresetClick = (presetMinutes) => {
    setDurationError('');
    const newEnd = form?.startTime ? minutesToTime(timeToMinutes(form?.startTime) + presetMinutes) : form?.endTime;
    setForm(prev => ({ ...prev, duration: presetMinutes, endTime: newEnd }));
  };

  const handleRecurrenceDayToggle = (dayIndex) => {
    const dayName = DAYS?.[dayIndex];
    setForm(prev => {
      const current = prev?.recurrenceDays || [];
      const updated = current?.includes(dayName)
        ? current?.filter(d => d !== dayName)
        : [...current, dayName];
      return { ...prev, recurrenceDays: updated };
    });
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Guard: ensure user is authenticated
    if (!userId) {
      setUploadError('You must be signed in to upload files. Please refresh and try again.');
      if (fileInputRef?.current) fileInputRef.current.value = '';
      return;
    }

    // ── Validation ──────────────────────────────────────────────────────────
    setUploadError('');
    const ext = file?.name?.split('.')?.pop()?.toLowerCase();
    if (file?.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File too large. Maximum size is 20 MB (this file is ${formatFileSize(file?.size)}).`);
      if (fileInputRef?.current) fileInputRef.current.value = '';
      return;
    }
    const mimeAllowed = ALLOWED_MIME_TYPES?.includes(file?.type);
    const extAllowed = ALLOWED_EXTENSIONS?.includes(ext);
    if (!mimeAllowed && !extAllowed) {
      setUploadError(`File type not supported. Allowed: images, PDF, Word, Excel, PowerPoint, TXT, CSV.`);
      if (fileInputRef?.current) fileInputRef.current.value = '';
      return;
    }
    // ── End validation ───────────────────────────────────────────────────────

    setUploadingFile(true);
    try {
      const path = `${userId}/${Date.now()}_${file?.name}`;
      const { error: storageError } = await supabase?.storage
        ?.from('task-attachments')
        ?.upload(path, file, { upsert: false });
      if (storageError) throw storageError;

      const newAttachment = {
        task_id: editingTask?.id || null,
        user_id: userId,
        file_name: file?.name,
        file_type: file?.type || `application/${ext}`,
        file_size: file?.size,
        storage_path: path,
        attachment_type: 'file',
        created_at: new Date()?.toISOString(),
      };

      if (editingTask?.id) {
        const { data, error: insertError } = await supabase?.from('task_attachments')?.insert(newAttachment)?.select()?.single();
        if (insertError) throw insertError;
        if (data) setAttachments(prev => [...prev, data]);
      } else {
        // Store locally until task is saved
        setAttachments(prev => [...prev, { ...newAttachment, id: `temp-${Date.now()}`, _tempPath: path }]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err?.message || '';
      if (msg?.includes('row-level security') || msg?.includes('policy') || msg?.includes('403')) {
        setUploadError('Permission denied. Please sign out and sign back in, then try again.');
      } else if (msg?.includes('Bucket not found') || msg?.includes('bucket')) {
        setUploadError('Storage not configured. Please contact support.');
      } else if (msg?.includes('duplicate') || msg?.includes('already exists')) {
        setUploadError('A file with this name already exists. Please rename and try again.');
      } else {
        setUploadError(`Upload failed: ${msg || 'Please try again.'}`);
      }
    } finally {
      setUploadingFile(false);
      if (fileInputRef?.current) fileInputRef.current.value = '';
    }
  };

  // Email attachment handler
  const handleEmailAttach = async ({ from, subject, body }) => {
    setShowEmailDialog(false);
    if (!userId) {
      setUploadError('You must be signed in to add attachments.');
      return;
    }
    const newAttachment = {
      task_id: editingTask?.id || null,
      user_id: userId,
      file_name: subject || 'Email',
      file_type: 'message/rfc822',
      attachment_type: 'email',
      email_from: from,
      email_subject: subject,
      email_body: body,
    };
    if (editingTask?.id) {
      const { data, error: insertError } = await supabase?.from('task_attachments')?.insert(newAttachment)?.select()?.single();
      if (!insertError && data) setAttachments(prev => [...prev, data]);
      else if (insertError) setUploadError(`Failed to save email: ${insertError?.message}`);
    } else {
      setAttachments(prev => [...prev, { ...newAttachment, id: `temp-email-${Date.now()}` }]);
    }
  };

  const handleDeleteAttachment = async (attachment) => {
    try {
      if (!attachment?.id?.toString()?.startsWith('temp')) {
        await supabase?.from('task_attachments')?.delete()?.eq('id', attachment?.id);
        if (attachment?.storage_path) {
          await supabase?.storage?.from('task-attachments')?.remove([attachment?.storage_path]);
        }
      }
      setAttachments(prev => prev?.filter(a => a?.id !== attachment?.id));
    } catch {}
  };

  const validate = () => {
    const newErrors = {};
    if (!form?.title?.trim()) newErrors.title = 'Task title is required';
    if (!form?.category) newErrors.category = 'Please select a category';
    if (!form?.date) newErrors.date = 'Please select a date';
    if (!form?.startTime) newErrors.startTime = 'Please set a start time';
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (durationError) return;
    setIsSaving(true);
    try {
      const duration = typeof form?.duration === 'number' ? form?.duration : parseInt(form?.duration, 10) || 60;
      const clampedDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration));
      const endTime = form?.endTime || minutesToTime(timeToMinutes(form?.startTime) + clampedDuration);
      const dateObj = new Date(form?.date + 'T12:00:00');
      const dayOfWeek = dateObj?.getDay();
      const day = DAYS?.[dayOfWeek];

      // For new tasks, don't pass a fake id — let the DB generate a real UUID
      const taskPayload = {
        ...editingTask,
        ...form,
        duration: clampedDuration,
        endTime,
        day,
        dayOfWeek,
        updatedAt: new Date()?.toISOString(),
      };
      // Only include id if editing an existing task with a real UUID
      if (editingTask?.id && !editingTask?.id?.toString()?.startsWith('task-')) {
        taskPayload.id = editingTask?.id;
      } else {
        delete taskPayload?.id;
      }

      const savedTask = await onSave?.(taskPayload);

      // Save pending attachments for new tasks using the real DB UUID
      const taskId = savedTask?.id || editingTask?.id;
      if (taskId && userId) {
        const pendingAttachments = attachments?.filter(a => a?.id?.toString()?.startsWith('temp'));
        for (const att of pendingAttachments) {
          const { _tempPath, id, ...rest } = att;
          const { error: attError } = await supabase?.from('task_attachments')?.insert({ ...rest, task_id: taskId });
          if (attError) console.error('Failed to save attachment:', attError?.message);
        }
      }
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) { setIsDeleting(true); return; }
    try {
      await onDelete?.(editingTask?.id);
      onClose?.();
    } catch {
      setIsDeleting(false);
    }
  };

  const selectedCategory = CATEGORIES?.find(c => c?.value === form?.category);
  const durationNum = typeof form?.duration === 'number' ? form?.duration : parseInt(form?.duration, 10);
  const durationDisplay = !isNaN(durationNum) ? `${durationNum} min` : '';

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-editor-title"
      >
        <div className="modal-container" ref={modalRef}>
          {/* Header */}
          <div className="modal-header">
            <div className="flex items-center gap-3">
              {selectedCategory && (
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCategory?.color }} aria-hidden="true" />
              )}
              <h2 id="task-editor-title" className="font-heading text-lg font-semibold text-foreground">
                {isEditing ? 'Edit Task' : 'New Task'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth focus:outline-none focus-ring"
              aria-label="Close modal"
            >
              <Icon name="X" size={18} color="currentColor" />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <Input
                ref={firstFocusableRef}
                label="Task Title"
                type="text"
                placeholder="What do you need to do?"
                value={form?.title}
                onChange={(e) => handleChange('title', e?.target?.value)}
                error={errors?.title}
                required
              />

              {/* Category */}
              <Select
                label="Category"
                placeholder="Select a life domain"
                options={CATEGORIES?.map(c => ({ value: c?.value, label: c?.label }))}
                value={form?.category}
                onChange={(val) => handleChange('category', val)}
                error={errors?.category}
                required
              />

              {/* Date & Start Time */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="Date" type="date" value={form?.date} onChange={(e) => handleChange('date', e?.target?.value)} error={errors?.date} required />
                <Input label="Start Time" type="time" value={form?.startTime} onChange={(e) => handleStartTimeChange(e?.target?.value)} error={errors?.startTime} required />
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-caption text-sm font-medium text-foreground">
                    Duration
                    {durationDisplay && <span className="ml-2 font-data text-xs text-muted-foreground">({durationDisplay})</span>}
                  </label>
                  {!isNaN(durationNum) && durationNum > 0 && (
                    <span className="font-caption text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: selectedCategory?.color + '22', color: selectedCategory?.color || 'var(--color-primary)' }}>
                      {formatDurationDisplay(durationNum)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_PRESETS?.map((preset) => (
                    <button key={preset?.value} type="button" onClick={() => handlePresetClick(preset?.value)}
                      className={`px-2.5 py-1 rounded-md font-caption text-xs font-medium transition-smooth border ${
                        durationNum === preset?.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                      }`}>
                      {preset?.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={MIN_DURATION} max={MAX_DURATION} value={form?.duration} onChange={(e) => handleDurationChange(e?.target?.value)}
                    className="w-24 px-3 py-2 rounded-md border text-sm font-data bg-card text-foreground border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-smooth" placeholder="min" />
                  <span className="font-caption text-xs text-muted-foreground">minutes</span>
                  {form?.endTime && form?.startTime && (
                    <span className="font-caption text-xs text-muted-foreground ml-auto">
                      Ends at <span className="font-data font-medium text-foreground">{form?.endTime}</span>
                    </span>
                  )}
                </div>
                {durationError && (
                  <p className="font-caption text-xs text-destructive flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} color="var(--color-destructive)" />
                    {durationError}
                  </p>
                )}
              </div>

              {/* End Time & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="End Time" type="time" value={form?.endTime} onChange={(e) => handleEndTimeChange(e?.target?.value)} />
                <Select label="Priority" options={PRIORITY_OPTIONS} value={form?.priority} onChange={(val) => handleChange('priority', val)} />
              </div>

              {/* ── Recurrence ─────────────────────────────────────────── */}
              <div className="flex flex-col gap-2">
                <label className="font-caption text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Icon name="RefreshCw" size={14} color="var(--color-primary)" />
                  Repeat
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RECURRENCE_TYPES?.map((rt) => (
                    <button key={rt?.value} type="button"
                      onClick={() => handleChange('recurrenceType', rt?.value)}
                      className={`px-3 py-1.5 rounded-full font-caption text-xs font-medium transition-smooth border ${
                        form?.recurrenceType === rt?.value
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                      }`}>
                      {rt?.label}
                    </button>
                  ))}
                </div>
                {form?.recurrenceType === 'custom' && (
                  <div className="flex gap-1.5 mt-1">
                    {DAY_ABBR?.map((abbr, i) => (
                      <button key={i} type="button"
                        onClick={() => handleRecurrenceDayToggle(i)}
                        className={`w-9 h-9 rounded-full font-caption text-xs font-semibold transition-smooth border ${
                          form?.recurrenceDays?.includes(DAYS?.[i])
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                            : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                        }`}>
                        {abbr}
                      </button>
                    ))}
                  </div>
                )}
                {form?.recurrenceType && form?.recurrenceType !== '' && (
                  <p className="font-caption text-xs text-[var(--color-primary)] flex items-center gap-1">
                    <Icon name="Info" size={11} color="var(--color-primary)" />
                    This task will repeat — copies are created for each recurrence day
                  </p>
                )}
              </div>

              {/* ── Notes ─────────────────────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <label className="font-caption text-sm font-medium text-foreground" htmlFor="task-notes">
                  Notes <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  id="task-notes"
                  value={form?.notes}
                  onChange={(e) => handleChange('notes', e?.target?.value)}
                  placeholder="Add any additional details…"
                  rows={3}
                  className="w-full px-4 py-3 font-body text-sm bg-card text-foreground border border-border rounded-md resize-none transition-smooth focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>

              {/* ── Attachments ───────────────────────────────────────── */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-caption text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Icon name="Paperclip" size={14} color="var(--color-primary)" />
                    Attachments
                    {attachments?.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-data text-xs">{attachments?.length}</span>
                    )}
                  </label>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setShowEmailDialog(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md font-caption text-xs font-medium bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-smooth">
                      <Icon name="Mail" size={12} color="currentColor" /> Email
                    </button>
                    <button type="button" onClick={() => { setUploadError(''); fileInputRef?.current?.click(); }}
                      disabled={uploadingFile}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md font-caption text-xs font-medium bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-smooth disabled:opacity-50">
                      {uploadingFile ? <div className="w-3 h-3 border border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /> : <Icon name="Upload" size={12} color="currentColor" />}
                      File
                    </button>
                  </div>
                </div>

                {/* Allowed file types hint */}
                <p className="font-caption text-xs text-[var(--color-muted-foreground)] flex items-center gap-1">
                  <Icon name="Info" size={11} color="currentColor" />
                  Images, PDF, Word, Excel, PPT, TXT, CSV · Max 20 MB
                </p>

                {/* Upload error */}
                {uploadError && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-destructive)]/10 border border-[var(--color-destructive)]/30">
                    <Icon name="AlertCircle" size={13} color="var(--color-destructive)" className="flex-shrink-0 mt-0.5" />
                    <p className="font-caption text-xs text-[var(--color-destructive)]">{uploadError}</p>
                  </div>
                )}

                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv" />

                {loadingAttachments ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="font-caption text-xs text-[var(--color-muted-foreground)]">Loading attachments…</span>
                  </div>
                ) : attachments?.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {attachments?.map((att) => {
                      const isEmail = att?.attachment_type === 'email';
                      const isImage = att?.file_type?.startsWith('image/');
                      const iconName = isEmail ? 'Mail' : isImage ? 'Image' : att?.file_type === 'application/pdf' ? 'FileText' : 'File';
                      const typeBadge = getFileTypeBadge(att?.file_type, att?.attachment_type);
                      const uploadDate = formatUploadDate(att?.created_at);
                      return (
                        <div
                          key={att?.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-smooth group"
                          onClick={() => setViewingAttachment(att)}
                          title={`Open ${att?.file_name}`}
                        >
                          <Icon name={iconName} size={14} color="var(--color-primary)" className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-caption text-xs font-medium text-[var(--color-foreground)] truncate group-hover:underline underline-offset-2">{att?.file_name}</p>
                              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-caption font-medium ${typeBadge?.color}`}>{typeBadge?.label}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {att?.file_size && <span className="font-data text-xs text-[var(--color-muted-foreground)]">{formatFileSize(att?.file_size)}</span>}
                              {uploadDate && (
                                <span className="font-caption text-xs text-[var(--color-muted-foreground)] flex items-center gap-0.5">
                                  <Icon name="Clock" size={10} color="currentColor" />
                                  {uploadDate}
                                </span>
                              )}
                              {isEmail && att?.email_from && <span className="font-caption text-xs text-[var(--color-muted-foreground)] truncate">From: {att?.email_from}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button type="button" onClick={(e) => { e?.stopPropagation(); setViewingAttachment(att); }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-border)] transition-smooth"
                              title="Preview">
                              <Icon name="Eye" size={12} color="var(--color-primary)" />
                            </button>
                            <button type="button" onClick={(e) => { e?.stopPropagation(); handleDeleteAttachment(att); }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-destructive)]/10 transition-smooth"
                              title="Remove">
                              <Icon name="X" size={12} color="var(--color-destructive)" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                    <Icon name="Paperclip" size={13} color="currentColor" />
                    <span className="font-caption text-xs">No attachments yet — add files or emails above</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {isEditing && (
              <Button variant={isDeleting ? 'destructive' : 'outline'} size="sm" onClick={handleDelete}
                iconName={isDeleting ? 'AlertTriangle' : 'Trash2'} iconPosition="left" iconSize={14} className="mr-auto">
                {isDeleting ? 'Confirm Delete' : 'Delete'}
              </Button>
            )}
            {isDeleting && <Button variant="ghost" size="sm" onClick={() => setIsDeleting(false)}>Cancel</Button>}
            {!isDeleting && (
              <>
                <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  loading={isSaving}
                  iconName={isEditing ? 'Check' : 'Plus'}
                  iconPosition="left"
                  iconSize={14}
                >
                  {isEditing ? 'Save Changes' : 'Add Task'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Attachment Viewer */}
      {viewingAttachment && <AttachmentViewer attachment={viewingAttachment} onClose={() => setViewingAttachment(null)} />}
      {/* Email Input Dialog */}
      {showEmailDialog && <EmailInputDialog onSave={handleEmailAttach} onClose={() => setShowEmailDialog(false)} />}
    </>
  );
};

export default TaskEditorModal;