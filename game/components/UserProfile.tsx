import React from 'react';
import { redditUser } from '../shared';

interface UserProfileProps {
  redditUser: redditUser;
}

const UserProfile: React.FC<UserProfileProps> = ({ redditUser }) => {
  return (
    <div id="user-profile">
      {redditUser.snoovatarUrl && (
        <img src={redditUser.snoovatarUrl} alt="User Avatar" height="100px" />
      )}
      <h2>u/{redditUser.username}</h2>
    </div>
  );
};

export default UserProfile;
