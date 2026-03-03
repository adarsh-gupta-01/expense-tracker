import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const SharingSettings = () => {
  const [viewerEmail, setViewerEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { currentUser, userProfile, refreshUserProfile } = useAuth();

  const viewers = useMemo(() => userProfile?.viewerEmails || [], [userProfile]);

  useEffect(() => {
    setMessage('');
    setError('');
  }, [viewers.length]);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const syncAccessEmailsForOwnerExpenses = async (emails) => {
    const ownerQuery = query(
      collection(db, 'expenses'),
      where('ownerUid', '==', currentUser.uid)
    );

    const snapshot = await getDocs(ownerQuery);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.forEach((expenseDoc) => {
      batch.update(expenseDoc.ref, {
        accessEmails: [currentUser.email.toLowerCase(), ...emails],
        ownerEmail: currentUser.email.toLowerCase(),
      });
    });
    await batch.commit();
  };

  const saveViewers = async (nextViewers) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        viewerEmails: nextViewers,
        updatedAt: serverTimestamp(),
      });

      await syncAccessEmailsForOwnerExpenses(nextViewers);
      await refreshUserProfile();
      setMessage('Viewer access updated successfully.');
    } catch (saveError) {
      console.error('Error updating viewer access:', saveError);
      setError('Unable to update viewer access. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddViewer = async (event) => {
    event.preventDefault();
    const email = viewerEmail.trim().toLowerCase();

    if (!email) {
      setError('Please enter an email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (email === currentUser.email) {
      setError('Your own email already has access.');
      return;
    }
    if (viewers.includes(email)) {
      setError('This email already has viewer access.');
      return;
    }

    await saveViewers([...viewers, email]);
    setViewerEmail('');
  };

  const handleRemoveViewer = async (email) => {
    const nextViewers = viewers.filter((viewer) => viewer !== email);
    await saveViewers(nextViewers);
  };

  return (
    <div className="fade-in pt-20 lg:pt-4 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 max-w-3xl lg:max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sharing Access</h1>
          <p className="text-gray-600">Allow specific email accounts to view your records.</p>
        </div>

        <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Viewer</h2>
        <form onSubmit={handleAddViewer} className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            value={viewerEmail}
            onChange={(event) => setViewerEmail(event.target.value)}
            className="input-field"
            placeholder="viewer@example.com"
            disabled={saving}
          />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Grant Access'}
          </button>
        </form>

        {message && <p className="text-sm text-green-700 mt-3">{message}</p>}
        {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
      </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Viewer Emails</h2>
        {viewers.length === 0 ? (
          <p className="text-gray-500">No viewer emails added yet.</p>
        ) : (
          <div className="space-y-3">
            {viewers.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              >
                <span className="text-sm text-gray-800 break-all">{email}</span>
                <button
                  onClick={() => handleRemoveViewer(email)}
                  className="text-sm text-red-600 hover:text-red-800"
                  disabled={saving}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SharingSettings;
