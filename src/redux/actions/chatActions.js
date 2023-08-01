import ApiUtils from '../../helpers/APIUtils';

const api = msg => new ApiUtils(msg);

export const handleChatChange = key => async dispatch => {
  try {
    dispatch({ type: 'CHANGE_SELECTED_CHAT', payload: key });
  } catch (err) {
    return false;
  }
};

export const handleChatList = (callAPI, data) => async dispatch => {
  try {
    const tempData = data;
    if (callAPI) {
      const token = localStorage.getItem('token');
      const res = await api().getAllUsers({
        authorization: token,
      });

      console.log('res', res.data.userData);
      res.data.userData.map((e, index) => {
        console.log('e', e);
        tempData.push({
          key: e._id,
          label: e.name,
          active: false,
          chatId: e.chatId,
        });
      });
    }
    console.log(tempData);
    await dispatch({ type: 'STORE_DATA', payload: tempData });

    return true;
  } catch (err) {
    return false;
  }
};

export const handleOnlineUser = data => async dispatch => {
  try {
    dispatch({ type: 'STORE_ONLINE_USERS', payload: data });
    return true;
  } catch (err) {
    return false;
  }
};
