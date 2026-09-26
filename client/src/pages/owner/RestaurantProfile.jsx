import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const PRESET_BANNERS = [
  { name: 'Warm Bistro', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Modern Dining', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Cozy Lounge', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Fine Restaurant', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80' },
];

const DICEBEAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'personas', label: 'Personas' },
  { id: 'bottts', label: 'Robots' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'fun-emoji', label: 'Fun Emoji' },
  { id: 'micah', label: 'Micah' },
  { id: 'notionists', label: 'Notionist' },
  { id: 'avataaars', label: 'Avataaars' },
];

const RestaurantProfile = () => {
  const { user, updateUser } = useAuth();

  // Restaurant profile state
  const [profile, setProfile] = useState({
    name: '',
    description: '',
    banner: '',
  });

  // User DiceBear profile state
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [avatarStyle, setAvatarStyle] = useState('adventurer');
  const [avatarSeed, setAvatarSeed] = useState(user?.name || 'Chef');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user?.name || 'Chef')}`
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/restaurant/profile');
        setProfile({
          name: data.name || '',
          description: data.description || '',
          banner: data.banner || '',
        });

        // Initialize user avatar from current user
        if (user) {
          setOwnerName(user.name || '');
          if (user.avatar) {
            setAvatarUrl(user.avatar);
            // Parse style and seed if it's a dicebear url
            const match = user.avatar.match(/dicebear\.com\/[^/]+\/([^/]+)\/svg\?seed=([^&]+)/);
            if (match) {
              setAvatarStyle(match[1]);
              setAvatarSeed(decodeURIComponent(match[2]));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Recalculate avatar URL whenever style or seed changes
  const updateDiceBearAvatar = (newStyle, newSeed) => {
    const cleanSeed = (newSeed || 'Pilot').trim();
    const url = `https://api.dicebear.com/9.x/${newStyle}/svg?seed=${encodeURIComponent(cleanSeed)}`;
    setAvatarUrl(url);
  };

  const handleStyleChange = (styleId) => {
    setAvatarStyle(styleId);
    updateDiceBearAvatar(styleId, avatarSeed);
  };

  const handleSeedChange = (seed) => {
    setAvatarSeed(seed);
    updateDiceBearAvatar(avatarStyle, seed);
  };

  const rollRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
    setAvatarSeed(randomSeed);
    updateDiceBearAvatar(avatarStyle, randomSeed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Update restaurant profile
      const { data: restData } = await API.put('/restaurant/profile', profile);

      // 2. Update owner profile (name and DiceBear avatar)
      const { data: userData } = await API.put('/auth/profile', {
        name: ownerName,
        avatar: avatarUrl,
      });

      // Update auth context so Navbar and other components reflect the avatar immediately
      if (userData.user && updateUser) {
        updateUser(userData.user);
      }

      setMessage({
        type: 'success',
        text: 'Profile & Restaurant Branding updated successfully! Changes are live across RestroPilot.',
      });

      if (restData.restaurant) {
        setProfile({
          name: restData.restaurant.name || '',
          description: restData.restaurant.description || '',
          banner: restData.restaurant.banner || '',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Profile & Restaurant Branding</h1>
        <p className="text-warm-500 text-sm sm:text-base mt-1">
          Customize your personal DiceBear avatar, account details, and dining customer branding.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-slide-down ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* SECTION 1: DICEBEAR AVATAR & OWNER PROFILE */}
      <div className="card p-6 sm:p-8 border border-warm-200 bg-white shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-warm-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-warm-900">
              Owner Profile & DiceBear Avatar
            </h2>
            <p className="text-xs text-warm-500 mt-0.5">Customize your interactive avatar powered by DiceBear API</p>
          </div>
          <button
            type="button"
            onClick={rollRandomAvatar}
            className="btn-secondary !px-3 !py-1.5 text-xs flex items-center gap-1.5 font-bold shadow-sm"
            title="Randomize avatar"
          >
            <span className="text-base leading-none">🎲</span>
            Roll Dice
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-brand-50 via-warm-100 to-amber-50 border-2 border-brand-200 p-2 shadow-card flex items-center justify-center relative overflow-hidden group">
              <img
                src={avatarUrl}
                alt="DiceBear Avatar Preview"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-[11px] font-semibold text-warm-400 uppercase tracking-wider">Live Preview</span>
          </div>

          {/* Avatar Controls */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">
                DiceBear Avatar Style
              </label>
              <div className="flex flex-wrap gap-2">
                {DICEBEAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleStyleChange(style.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      avatarStyle === style.id
                        ? 'bg-brand-500 text-white border-brand-600 shadow-brand shadow-sm'
                        : 'bg-warm-50 text-warm-700 border-warm-200 hover:bg-warm-100'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-1.5">
                  Avatar Seed (Type any word)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={(e) => handleSeedChange(e.target.value)}
                    className="input-field !py-2 text-sm"
                    placeholder="e.g. Maverick, Chef, Restro"
                  />
                  <button
                    type="button"
                    onClick={rollRandomAvatar}
                    className="p-2.5 bg-warm-100 hover:bg-warm-200 rounded-xl text-warm-700 font-bold text-sm border border-warm-200 transition-colors"
                    title="Roll new seed"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-1.5">
                  Manager / Owner Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="input-field !py-2 text-sm"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: RESTAURANT BRANDING & LIVE CUSTOMER PREVIEW */}
      <div className="card overflow-hidden shadow-card border border-warm-200">
        <div className="relative h-44 sm:h-56 bg-warm-900 overflow-hidden">
          {profile.banner ? (
            <img
              src={profile.banner}
              alt="Banner preview"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white/50 text-sm">
              Default Warm Gradient
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Restaurant name and tagline over banner */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h2 className="text-2xl sm:text-3xl font-black truncate drop-shadow-md">
              {profile.name || 'Restaurant Name'}
            </h2>
            {profile.description && (
              <p className="text-white/85 text-xs sm:text-sm line-clamp-2 mt-1 font-medium leading-snug">
                {profile.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-5 sm:p-8 space-y-6 border border-warm-200 bg-white">
        <div className="border-b border-warm-100 pb-3">
          <h2 className="text-lg font-bold text-warm-900">
            Restaurant Details & Customer Menu
          </h2>
          <p className="text-xs text-warm-500 mt-0.5">These details appear when customers scan the table QR code</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-warm-800 mb-2">Restaurant Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-field"
            placeholder="e.g. RestroPilot Grand Diner"
            required
          />
        </div>

        {/* Tagline / Description */}
        <div>
          <label className="block text-sm font-bold text-warm-800 mb-2">Tagline & Cuisine Description</label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="input-field resize-none h-24"
            placeholder="e.g. Multi-Cuisine Casual Dining • Fast Delivery, Authentic Flavors & Beverages"
          />
          <p className="text-xs text-warm-400 mt-1.5">Displayed prominently under the restaurant name on the customer menu.</p>
        </div>

        {/* Banner URL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-warm-800">Hero Banner Background (URL)</label>
            <span className="text-xs text-warm-400">Wide landscape image</span>
          </div>
          <input
            type="url"
            value={profile.banner}
            onChange={(e) => setProfile({ ...profile, banner: e.target.value })}
            className="input-field"
            placeholder="https://images.unsplash.com/photo-..."
          />

          {/* Preset Banners */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-warm-500 font-semibold">Quick Presets:</span>
            {PRESET_BANNERS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setProfile({ ...profile, banner: preset.url })}
                className="text-xs bg-warm-100 hover:bg-brand-50 hover:text-brand-700 text-warm-700 px-2.5 py-1 rounded-lg border border-warm-200 transition-colors font-medium"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-warm-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto !py-3 !px-8 text-base shadow-brand font-bold"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Save Profile & Branding
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantProfile;
