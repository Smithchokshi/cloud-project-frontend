import React from 'react';
import { Layout, Menu, Divider, Tooltip } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { handleSidebarChange } from '../redux/actions/sidebarAction';
import { logout } from '../redux/actions/authActions';
import LOGO from '../assets/light-logo.svg';
import './sidebar.css';

const { Sider } = Layout;
const { Item } = Menu;

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCollapsed, activatedSidebarKey, sidebarData } = useSelector(state => state.sidebar);

  const changeSidebar = async e => {
    try {
      console.log(e.key);
      if (e.key === '/logout') {
        await dispatch(logout());
        navigate(`${e.url}`);
      }
      await dispatch(handleSidebarChange(e));
      navigate(`${e.url}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Sider trigger={null} collapsible collapsed={isCollapsed}>
      <div className="demo-logo-vertical" />
      <Menu theme="dark" mode="inline" selectedKeys={[activatedSidebarKey.key]}>
        <Item key="/" className="menu-item-wrapper markethub-item">
          {isCollapsed ? (
            <span className="menu-item-text">
              <img
                src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/001/781/752/datas/original.png"
                alt="Logo"
                className="logo-image"
              />
            </span>
          ) : (
            <div className="menu-item-text">
              <img src={LOGO} alt="Logo" className="logo-image" />
              MarketHub
            </div>
          )}
        </Item>

        <Divider className="sidebar-divider" />
        {sidebarData.map(e => (
          <Item key={e.key} onClick={() => changeSidebar(e)} className="menu-item-wrapper">
            {isCollapsed ? (
              <Tooltip placement="right" title={<span className="menu-item-text">{e.label}</span>}>
                <span className="menu-item-text">{e.icon}</span>
              </Tooltip>
            ) : (
              <span className="menu-item-text">
                {e.icon} {e.label}
              </span>
            )}
          </Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
