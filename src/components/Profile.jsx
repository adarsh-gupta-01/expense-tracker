import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaUserCircle } from 'react-icons/fa';

const Profile = () => {
  const { currentUser, userProfile, updateProfile, updateProfilePhoto } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setMessage('');
    setError('');

    try {
      await updateProfilePhoto(file);
      setMessage('Profile photo updated!');
    } catch (uploadError) {
      console.error(uploadError);
      setError('Unable to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
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
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <FaUserCircle className="w-24 h-24 text-gray-300" />
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                <FaCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xl" />
              </div>
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>

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
