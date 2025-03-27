import React from 'react';
import { redditUser } from '../shared';

interface UserFeedProps {
  redditUser: redditUser;
}

const UserFeed: React.FC<UserFeedProps> = ({ redditUser }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h2>Reddit User Details</h2>
      <p>
        <strong>Username:</strong> {redditUser.username}
      </p>
      <p>
        <strong>User ID:</strong> {redditUser.id}
      </p>
      <img
        src={redditUser.snoovatarUrl}
        alt="User Avatar"
        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
      />
      <p>{redditUser.isAdmin}</p>
      <p>{redditUser.nsfw}</p>
    </div>
  );
};

export default UserFeed;
