import { useState, useCallback } from 'react';
import { validateProfileFields } from '../utils/validateProfileFields';

/**
 * Hook to manage profile edit state, including draft changes and validation.
 * @param {Object} initialData - The current profile data.
 * @param {Function} onSave - Async function to call on save passing the changed fields.
 * @param {Function} showToast - Toast notification function.
 */
export const useProfileEdit = (initialData, onSave, showToast) => {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const startEditing = useCallback(() => {
    setDraft(initialData);
    setErrors({});
    setServerError(null);
    setEditMode(true);
  }, [initialData]);

  const handleCancel = useCallback(() => {
    setDraft(initialData);
    setErrors({});
    setServerError(null);
    setEditMode(false);
  }, [initialData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSave = async () => {
    setServerError(null);
    
    // 1. Client-side validation
    const { valid, errors: validationErrors } = validateProfileFields(draft);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    // 2. Identify changed fields only
    const changedFields = {};
    Object.keys(draft).forEach(key => {
      if (draft[key] !== initialData[key]) {
        changedFields[key] = draft[key];
      }
    });

    if (Object.keys(changedFields).length === 0 && !draft.newPhoto) {
      setEditMode(false);
      return;
    }

    // 3. API Call
    setIsSaving(true);
    try {
      await onSave(changedFields);
      showToast('Profile updated successfully', 'success');
      setEditMode(false);
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    editMode,
    draft,
    errors,
    isSaving,
    serverError,
    startEditing,
    handleCancel,
    handleChange,
    handleSave,
    setDraft, // For photo uploads or manual overrides
  };
};
