import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Layout, Modal, theme } from 'antd';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useSimpleReactValidator from '../../helpers/useReactSimpleValidator';
import { register } from '../../redux/actions/authActions';
import './register.css';
import AWS from 'aws-sdk';

const { Content } = Layout;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [loading, setLoading] = useState(false);
  const [isCodeSend, setIsCodeSend] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const [poolData, setPoolData] = useState({});
  const [fields, setFields] = useState({
    name: null,
    email: null,
    postalCode: null,
    password: null,
    confirmPassword: null,
  });

  const [poolId, setPoolId] = useState(null);
  const [clientId, setClientId] = useState(null);

  const [validator, setValidator] = useSimpleReactValidator(
    {},
    {
      matchPassword: {
        message: 'Password doesn`t match',
        rule: (val, params, validator) => {
          return val === fields?.password;
        },
      },
      postalCode: {
        message: 'Please enter postal code in B3J2K9 format',
        rule: (val, params) => {
          return (
            validator.helpers.testRegex(val, /^[A-Z]\d[A-Z]\d[A-Z]\d$/) &&
            params.indexOf(val) === -1
          );
        },
      },
      passwwordLength: {
        message: 'Password is not in correct format and length should be minimum 8',
        rule: (val, params) => {
          return (
            validator.helpers.testRegex(
              val,
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ) && params.indexOf(val) === -1
          );
        },
      },
    }
  );

  const handleChange = (e, field) => {
    setFields(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleVerifyCode = async () => {
    try {
      if (validator.allValid()) {
        let userPool = new CognitoUserPool(poolData);
        let userData = {
          Username: fields?.email,
          Pool: userPool,
        };

        let cognitoUser = new CognitoUser(userData);
        await cognitoUser.confirmRegistration(verificationCode, true, async function (err, result) {
          if (err) {
            alert(err.message || JSON.stringify(err));
            return;
          }
          console.log('call result: ' + result);
          setLoading(true);

          await dispatch(register(fields));
          setLoading(false);
          navigate('/login');
          setIsCodeSend(false);
        });
      } else {
        setLoading(false);
        validator.getErrorMessages();
        setValidator(true);
      }
    } catch (e) {}
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (validator.allValid()) {
      let userPool = new CognitoUserPool(poolData);

      const attributeList = [];

      let dataEmail = {
        Name: 'email',
        Value: fields?.email,
      };
      let attributeEmail = new CognitoUserAttribute(dataEmail);

      attributeList.push(attributeEmail);

      try {
        const result = await new Promise((resolve, reject) => {
          userPool.signUp(fields?.email, fields?.password, attributeList, null, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        const cognitoUser = result.user;
        console.log('User name is ' + cognitoUser.getUsername());
        setIsCodeSend(true);
      } catch (error) {
        alert(error.message || JSON.stringify(error));
      }
      setLoading(false);
    } else {
      setLoading(false);
      validator.getErrorMessages();
      setValidator(true);
    }
  };

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
        setPoolData({
          UserPoolId: ans.UserPoolID,
          ClientId: ans.ClientPoolID,
        });
        setClientId(ans.ClientPoolID);
        setPoolId(ans.UserPoolID);
      }
    });
  };

  useEffect(() => {
    (async () => {
      await callSM();
    })();
  }, []);

  return (
    <Layout>
      {/*<GlobalHeader title={'Products'} />*/}
      <Content>
        <div className="login-page">
          <div className="login-box">
            <div className="illustration-wrapper" style={{ background: '#fff' }}>
              <img
                src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/001/781/752/datas/original.png"
                alt="Register"
              />
            </div>
            <Form
              className="login-form"
              name="login-form"
              initialValues={{ remember: true }}
              layout="vertical"
            >
              <p className="form-title">Sign Up</p>
              <Form.Item
                className=""
                label={
                  <span className="label">
                    <span className="required-asterisk">*</span>
                    Name
                  </span>
                }
              >
                <Input
                  type="text"
                  placeholder="Enter your Name"
                  value={fields.name}
                  onChange={e => handleChange(e, 'name')}
                  autoComplete="new-password"
                  className="custom-input"
                />
                <div className={validator.errorMessages.name ? 'error-message' : ''}>
                  {validator.message('Name', fields.name, 'required|alpha_space')}
                </div>
              </Form.Item>
              <Form.Item
                className=""
                label={
                  <span className="label">
                    <span className="required-asterisk">*</span>
                    Email
                  </span>
                }
              >
                <Input
                  type="text"
                  placeholder="Enter your Email"
                  value={fields.email}
                  onChange={e => handleChange(e, 'email')}
                  autoComplete="new-password"
                  className="custom-input"
                />
                <div className={validator.errorMessages.email ? 'error-message' : ''}>
                  {validator.message('Email', fields.email, 'required|email')}
                </div>
              </Form.Item>
              <Form.Item
                className=""
                label={
                  <span className="label">
                    <span className="required-asterisk">*</span>
                    Postal Code
                  </span>
                }
              >
                <Input
                  type="text"
                  placeholder="Enter your Postal Code"
                  value={fields.postalCode}
                  onChange={e => handleChange(e, 'postalCode')}
                  autoComplete="new-password"
                  className="custom-input"
                />
                <div className={validator.errorMessages.postalCode ? 'error-message' : ''}>
                  {validator.message('Postal Code', fields.postalCode, 'required|postalCode')}
                </div>
              </Form.Item>

              <Form.Item
                label={
                  <span className="label">
                    <span className="required-asterisk">*</span>
                    Password
                  </span>
                }
              >
                <Input.Password
                  placeholder="Enter your Password"
                  value={fields.password}
                  onChange={e => handleChange(e, 'password')}
                  autoComplete="new-password"
                  className="custom-input"
                />
                <div className={validator.errorMessages.password ? 'error-message' : ''}>
                  {validator.message('Password', fields.password, 'required|passwwordLength')}
                </div>
              </Form.Item>

              <Form.Item
                label={
                  <span className="label">
                    <span className="required-asterisk">*</span>
                    Confirm Password
                  </span>
                }
              >
                <Input.Password
                  placeholder="Confirm your Password"
                  value={fields.confirmPassword}
                  onChange={e => handleChange(e, 'confirmPassword')}
                  autoComplete="new-password"
                  className="custom-input"
                />
                <div className={validator.errorMessages.confirmPassword ? 'error-message' : ''}>
                  {validator.message(
                    'Confirm Password',
                    fields.confirmPassword,
                    'required|matchPassword|passwwordLength'
                  )}
                </div>
              </Form.Item>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                }}
              >
                <p>
                  Already have an account? <a href="/login">Log In</a>
                </p>
              </div>
              <Form.Item>
                <Button
                  className="login-form-button"
                  type="primary"
                  htmlType="submit"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Sign Up
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        {isCodeSend && (
          <Modal
            title="Verification Code"
            open={isCodeSend}
            footer={[
              <Button key="cancel" onClick={() => setIsCodeSend(false)}>
                Cancel
              </Button>,
              <Button key="verify" type="primary" loading={loading} onClick={handleVerifyCode}>
                verify
              </Button>,
            ]}
            onCancel={() => setIsCodeSend(false)}
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
              <Form.Item label="Verification">
                <Input
                  placeholder="Verification Code"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                />
                {validator.message('verification code', verificationCode, 'required|numeric')}
              </Form.Item>
            </Form>
          </Modal>
        )}
      </Content>
    </Layout>
  );
};
export default Register;
