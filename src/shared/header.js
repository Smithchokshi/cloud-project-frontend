import React, { useEffect, useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, Button, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { handleCollapse, handleSidebarChange } from '../redux/actions/sidebarAction';
import './header.css';

const { Header } = Layout;

const GlobalHeader = ({ title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCollapsed, activatedSidebarKey, sidebarData } = useSelector(state => state.sidebar);
  const { selectedChat, chatList } = useSelector(state => state.chat);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [label, setLabel] = useState(null);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const storeLabel = async () => {
    const [filterData] = sidebarData.filter(cur => cur.key === activatedSidebarKey?.key);
    const tempData = {
      key: activatedSidebarKey?.key,
      label: filterData?.label,
    };
    await dispatch(handleSidebarChange(tempData));
    setLabel(filterData?.label);
  };

  useEffect(() => {
    (async () => {
      if (!activatedSidebarKey?.label) await storeLabel();
      else setLabel(activatedSidebarKey?.label);
    })();
  }, [activatedSidebarKey?.key]);

  useEffect(() => {
    setLabel(`${activatedSidebarKey?.label} / ${selectedChat?.label}`);
  }, [selectedChat?.key]);

  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
      className="header-container"
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated && (
          <Button
            type="text"
            icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => dispatch(handleCollapse())}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="menu-button"
          />
        )}
        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
          {title === 'Products' ? <></> : <span>{title}</span>}
        </div>
      </div>
    </Header>
  );
};

export default GlobalHeader;
