import { DBUserRow } from "@/types/ws-server-types.ts";
import UserIcon from "./user-icon.tsx";

interface UserActiveChannelMap {
  userId: string,
  username: string,
  channelName: string | null,
}

const UserPanel = ({
  connected, allUsers,
  onlineUsers, channelMap,
  usersActiveChannel
}: {
  connected: boolean,
  allUsers: DBUserRow[],
  onlineUsers: string[],
  channelMap: Record<string, string>,
  usersActiveChannel: Record<string, string | null>
}): React.ReactElement => {

  const userActiveChannelMap: UserActiveChannelMap[] = allUsers.map(usr => {
    const activeChannelId = usersActiveChannel[usr.id];
    return {
      userId: usr.id,
      username: usr.username,
      channelName: activeChannelId ? channelMap[activeChannelId] : null
    };
  });
  // console.log(userActiveChannelMap);

  return (
    <>
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-white/5">
        <h2 className="text-lg font-bold text-white tracking-wide">User List</h2>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {/* User */}
        {userActiveChannelMap.map(map => {
          // console.log(onlineUsers);
          const isOnline = onlineUsers.includes(map.userId);
          return (
            <div key={map.userId} className="flex gap-4 items-center p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group">
              {!isOnline && (
                <div aria-label="error" className="status status-error" />
              )}
              {isOnline && (
                <div className="inline-grid *:[grid-area:1/1]">
                  <div className="status status-success animate-ping"></div>
                  <div className="status status-success"></div>
                </div>
              )}
              <div className="w-10 relative">
                <UserIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200 group-hover:text-white">{map.username}</p>
                <p className="text-xs text-gray-500">{isOnline ? map.channelName ? `In ${map.channelName}` : 'online' : 'offline'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / My Status */}
      <div className="p-4 bg-black/20 border-t border-white/5 text-center text-xs text-gray-500">
        Socket {connected ? 'Connected' : 'Disconnected'}
      </div>
    </>
  );
};

export default UserPanel;