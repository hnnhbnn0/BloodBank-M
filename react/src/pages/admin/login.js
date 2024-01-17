import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import preferences from '../../config/preferences';
import Auth from "../../context/auth";
import cookie from '../../helpers/cookie';

const Login = () => {

    const navigate = useNavigate();
    const formLogin = useRef(null);
    const titles = ['Account Login'];
    const timeout = 1500;
    const step = 1;
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('Warning!');
    const [errorVisibility, setErrorVisibility] = useState('invisible');
    const [disabledSubmit, setDisabledSubmit] = useState(false);

    const { login, domain } = Auth.getContext();
    const background = preferences.background.color;
    const gradient = preferences.background.gradient;

    const submitReset = useCallback(() => {
        if (error) {
            setError(false);
            setErrorMessage('Reset!');
            setErrorVisibility('invisible');
            setDisabledSubmit(false);

            const form = formLogin.current;
            const currentFieldset = form.querySelector('fieldset.active');
            const inputs = currentFieldset.querySelectorAll('input.required');
            inputs.forEach((input) => {
                input.classList.remove('is-invalid');
            });
        }
    }, [error]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const form = formLogin.current;
        const currentFieldset = form.querySelector('fieldset.active');
        const inputs = currentFieldset.querySelectorAll('input.required');

        const count = inputs.length;
        const valid = Array.from(inputs).reduce((acc, input) => (input.value.trim() !== '' ? (acc + 1) : acc), 0);

        const missing = Array.from(inputs).reduce((acc, input) => {
            const isValid = input.value.trim() !== '';
            if (!isValid) {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
                acc.push(input.getAttribute('placeholder'));
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
            return acc;
        }, []);

        const submitError = (errorMsg, callback) => {
            setError(true);
            setErrorMessage(errorMsg);
            setErrorVisibility('visible');
            setDisabledSubmit(true);

            let firstNull = null;
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    if (!firstNull) {
                        firstNull = input;
                    }
                }
            });
            if (firstNull !== null) {
                firstNull.focus();
            }
            if (typeof callback === 'function') {
                callback();
            }
        };

        const submitSuccess = (successMsg, callback) => {
            setErrorMessage(successMsg);
            setErrorVisibility('visible');
            if (typeof callback === 'function') {
                callback();
            }
        }

        if (valid !== count) {
            submitError(`The ${missing.join(', ')} is missing.`);
        } else {
            const email = form.email;
            const password = form.password;

            const response = await axios.post(domain.concat("api/v/login"), {
                email: email.value,
                password: password.value,
            });

            if (response.data.verified) {
                login(response.data.credentials);
                cookie.set("session", response.data.cookie);
                sessionStorage.setItem("position", response.data.credentials.position);

                submitSuccess(response.data.message, setTimeout(() => {
                    // submitSuccess(response.data.message, setTimeout(() => {
                    navigate(response.data.url || "/public/login");
                    // }, timeout));
                    setErrorVisibility('invisible');
                }, timeout / 3));
            } else {
                submitError(response.data.message, () => {
                    email.classList.remove('is-valid');
                    email.classList.add('is-invalid');
                    password.classList.remove('is-valid');
                    password.classList.add('is-invalid');
                });
            }
        }
    };

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                submitReset();
            }, timeout);
        }
    }, [error, submitReset]);

    return (
        <>
            <Header />
            <main>
                <Alert variant={background} className="mb-0 rounded-0">
                    <Container>
                        <Row>
                            <Col sm={10} md={8} lg={7} className="d-flex align-items-center mx-auto">
                                <Container className="d-block my-5">
                                    <Alert variant="light" className="position-relative shadow p-3">
                                        <Form ref={formLogin} onSubmit={handleSubmit}>
                                            <Badge bg={background} className={`fs-5 position-absolute top-0 start-100 translate-middle ${gradient ? 'bg-gradient' : ''}`}>{error ? 'ERROR!' : `${step} of ${titles.length}`}</Badge>
                                            <div className="d-flex justify-content-between">
                                                <div className="fs-4 fw-bold">{titles[step - 1]}</div>
                                            </div>
                                            <div className="fs-5">Plase enter your credentials.</div>
                                            <small className={`d-block mb-2 ${errorVisibility} ${error ? 'text-danger' : 'text-success'} fs-bold`}>{errorMessage}</small>
                                            <fieldset className={step === 1 ? 'd-block active' : 'd-none'}>
                                                <Form.Floating className="mb-3">
                                                    <Form.Control name="email" type="email" className="required" placeholder="Email" autoComplete="off" autoFocus="on" />
                                                    <label>Email</label>
                                                </Form.Floating >
                                                <Form.Floating className="mb-3">
                                                    <Form.Control name="password" type="password" className="required" minLength="8" placeholder="Password" autoComplete="off" />
                                                    <label>Password</label>
                                                </Form.Floating >
                                            </fieldset>
                                            <Button variant={background} type="submit" className="w-100" disabled={disabledSubmit}>Submit</Button>
                                        </Form>
                                    </Alert>
                                </Container>
                            </Col>
                        </Row>
                    </Container>
                </Alert>
            </main>
            <Footer />
        </>
    );
}

export default Login;