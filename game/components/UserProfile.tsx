import React from 'react';
import { redditUser } from '../shared';

interface UserProfileProps {
  redditUser: redditUser;
}

const UserProfile: React.FC<UserProfileProps> = ({ redditUser }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h2>Reddit User Details</h2>
      <div>
        <img src={redditUser.snoovatarUrl} alt="User Avatar" /> <h2>{redditUser.username}</h2>
      </div>
    </div>
  );
};

export default UserProfile;
