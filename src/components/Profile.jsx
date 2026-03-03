import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setDisplayName(userProfile?.displayName || '');
  }, [userProfile?.displayName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await updateProfile({ displayName });
      setMessage('Profile updated successfully.');
    } catch (updateError) {
      console.error(updateError);
      setError('Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in pt-20 lg:pt-4 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 max-w-3xl lg:max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Profile</h1>
          <p className="text-gray-700">Edit your account details.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input value={currentUser?.email || ''} readOnly className="input-field bg-gray-50" />
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="input-field"
              placeholder="Your name"
              disabled={saving}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
