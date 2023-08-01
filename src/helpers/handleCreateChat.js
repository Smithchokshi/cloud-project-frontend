import React from 'react';
import ApiUtils from './APIUtils';
import { handleSidebarChange } from '../redux/actions/sidebarAction';
import { handleChatChange, handleChatList } from '../redux/actions/chatActions';

const api = msg => new ApiUtils(msg);

const handleCreateChat = async (userId, navigate, dispatch) => {
  try {
    const data = {
      secondId: userId,
    };

    const res = await api(false).createChat(data);

    await Promise.all([
      dispatch(handleSidebarChange({ key: '/chats' })),
      dispatch(handleChatList(true, [])),
      dispatch(handleChatChange({})),
    ]);

    if (res) navigate(`/chats/${res.data.chat._id}`);
  } catch (e) {
    console.log(e);
  }
};

export default handleCreateChat;
