import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button, Form, Input } from 'antd';
import useSimpleReactValidator from '../helpers/useReactSimpleValidator';
import APIUtils from '../helpers/APIUtils';
import '../components/Chat/chat.css';
import AWS from 'aws-sdk';
const api = (msg, isPayment) => new APIUtils(msg, isPayment);

const PaymentModal = ({ paymentModal, handleModal, payableAmount, handlePayableAmount }) => {
  const handleCancel = () => {
    handlePayableAmount(null);
    handleModal(false);
  };
  const { selectedChat, chatList } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  const [validator, setValidator] = useSimpleReactValidator();
  const [loading, setLoading] = useState(false);
  const [api, setAPI] = useState(null);
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
    sessionToken: process.env.REACT_APP_SESSION_TOKEN,
    region: process.env.REACT_APP_REGION,
  });

  const callSM = async () => {
    const secretsManager = new AWS.SecretsManager({
      accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
      sessionToken: process.env.REACT_APP_SESSION_TOKEN,
      region: process.env.REACT_APP_REGION,
    });
    secretsManager.getSecretValue({ SecretId: 'CloudSecret' }, function (err, data) {
      if (err) {
        console.log('Error retrieving secret value: ', err);
      } else {
        console.log('Secret value: ', data.SecretString);
        const ans = JSON.parse(data.SecretString);
        console.log(ans.Deployment);
        setAPI(ans.Deployment);
      }
    });
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (validator.allValid()) {
        const [recipient] = chatList.filter(cur => cur.key === selectedChat.key);
        const tempData = {
          location: window.location.href,
          amount: payableAmount,
          name: selectedChat?.label,
          chatId: location.pathname.split('/chats/')[1],
          recipientId: recipient?.key,
          userId: user,
        };
        const url = `https://${api}.execute-api.us-east-1.amazonaws.com/Prod/createcheckoutsession`;
        const res = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(tempData),
        });
        const response = await res.json();
        window.location.href = JSON.parse(response?.body).url;
        setLoading(false);
      } else {
        setLoading(false);
        validator.getErrorMessages();
        setValidator(true);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    callSM();
  }, []);
  return (
    <Modal
      title="Add Amount"
      open={paymentModal}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="pay" type="primary" loading={loading} onClick={handleSubmit}>
          Pay
        </Button>,
      ]}
      onCancel={handleCancel}
      maskClosable={false}
    >
      <Form
        name="basic"
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="off"
      >
        {' '}
        <Form.Item label="Amount">
          <Input
            placeholder="Enter Amount"
            value={payableAmount}
            onChange={e => handlePayableAmount(e.target.value)}
          />
          {validator.message('amount', payableAmount, 'required|numeric|min:1,num')}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
