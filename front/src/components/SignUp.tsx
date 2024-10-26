import React, { useState, useEffect } from "react";
import { IGoogleSession, ISignUpComponentProps, ISignUpForm } from "@/interface/types";
import styles from "../styles/LogSign.module.css";
import { FaGoogle, FaApple, FaEnvelope } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { registerProps } from "@/helpers/signUpHelpers";
import Swal from "sweetalert2";

const SignUp: React.FC<ISignUpComponentProps> = ({ onCloseSignUp, onSwitchToLogin }) => {
    const initialState: ISignUpForm = {
        user_name: "",
        user_lastname: "",
        email: "",
        password: "",
        confirm_password: "",
        role_name: null,
        isOlder: false,
    }
    const [userData, setUserData] = useState<ISignUpForm>(initialState);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isAuthButtonDisabled, setIsAuthButtonDisabled] = useState(true);
    
    const validateForm = (data: ISignUpForm): string[] => {
        const errors: string[] = [];
        if (data.user_name.trim() === "") errors.push("Name is required");
        if (data.user_lastname.trim() === "") errors.push("Last name is required");
        if (data.email.trim() === "") errors.push("Email is required");
        if (data.password.trim() === "") errors.push("Password is required");
        if (data.password !== data.confirm_password) errors.push("Passwords do not match");
        if (data.role_name === null) errors.push("Please select if you are a buyer or supplier");
        if (!data.isOlder) errors.push("You must confirm that you are of legal age");
        return errors;
    }

    const handleChangeRegister = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
                
        setUserData((prevData) => {
            const updatedData = { ...prevData };
        
            if (type === "checkbox") {
                if (name === "supplier" || name === "buyer") {
                    updatedData.role_name = checked ? name : null;
                } else if (name === "isOlder") {
                    updatedData.isOlder = checked;
                }
            } else {
                (updatedData as any)[name] = value;
            }
        
            const errors = validateForm(updatedData);
            setIsButtonDisabled(errors.length > 0);
            return updatedData;
        });
    };

    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const errors = validateForm(userData);
        if (errors.length === 0) {
            try {
                console.log("Sending to backend:", JSON.stringify(userData));
                
                await registerProps(userData);
                await Swal.fire({
                    title: `Welcome!`,
                    text: `You have successfully logged in.`,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                });
                setUserData(initialState); // Reset form after successful submission
                onCloseSignUp();
            } catch (error) {
                console.error("Registration error:", error);
                alert("Registration failed. Please try again.");
            }
        } else {
            alert("Please correct the following errors:\n\n" + errors.join("\n"));
        }
    };
    
    const handleOnSubmitAuth = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        console.log("UserData before submission:", userData);
    
        if (!userData.role_name) {
            return;
        }
    
        // Create the objeth with the available data 
        const newUser: IGoogleSession = {
            name: userData.user_name || "",
            email: userData.email || "",
            role_name: userData.role_name,
        };
    
        localStorage.setItem('userRole', userData.role_name);

        await signIn("google");
    };

        useEffect(() => {
            const isRoleSelected = userData.role_name !== null;
            setIsAuthButtonDisabled(!isRoleSelected);
        }, [userData.role_name, userData.isOlder]);
    
    return (
        <section className={styles.LogSign}>
            <button onClick={onCloseSignUp} className='border-[2px] border-solid border-black pr-[0.5rem] pl-[0.5rem]'> x </button>
            <form className="flex flex-col" onSubmit={handleOnSubmit}>
                <h1 className={styles.Title}>Join Agro Dexports</h1>
                <div className="w-[50%] m-auto mb-[2rem]">
                    <input
                        name="supplier"
                        checked={userData.role_name === "supplier"}
                        onChange={handleChangeRegister}
                        className={styles.Supplier}
                        type="checkbox"
                    />{" "}
                    I&apos;m a supplier
                    <input
                        name="buyer"
                        checked={userData.role_name === "buyer"}
                        onChange={handleChangeRegister}
                        className="ml-[8rem]"
                        type="checkbox"
                    />{" "}
                    I&apos;m a buyer
                </div>
                <div className="w-[40%] flex flex-col m-auto mb-[3rem] ">
                    <input className={styles.CommonInput}
                        value={userData.user_name}
                        onChange={handleChangeRegister}
                        name='user_name'
                        type="text" 
                        required
                        placeholder='Name' />

                    <input className={styles.CommonInput}
                        value={userData.user_lastname}
                        onChange={handleChangeRegister}
                        name='user_lastname'
                        type="text" 
                        required
                        placeholder='Last name' />

                    <input className={styles.CommonInput}
                        value={userData.email}
                        onChange={handleChangeRegister}
                        name='email'
                        type="email" 
                        required
                        placeholder='Email address' />

                    <input className={styles.CommonInput}
                        value={userData.password}
                        onChange={handleChangeRegister}
                        name='password'
                        type="password" 
                        required
                        placeholder='Password' />

                    <input className={styles.Password}
                        value={userData.confirm_password}
                        onChange={handleChangeRegister}
                        name='confirm_password'
                        type="password" 
                        required
                        placeholder='Repeat password' />

                    <div className="mb-[2rem]">
                        <input
                            name="isOlder"
                            type="checkbox"
                            checked={userData.isOlder}
                            onChange={handleChangeRegister}
                            required
                        />{" "} I am of legal age.
                    </div>

                    <button type="submit" className={styles.ButtonLogin} disabled={isButtonDisabled}>Continue</button>
                </div>
                <p className={styles.OR}> ------------------- OR -------------------</p>
                <div>
                    <button className={styles.ButtonGoogle} onClick={async (event) => { await handleOnSubmitAuth(event);}} disabled={isAuthButtonDisabled}>
                        <FaGoogle />
                        <p className="ml-[1rem]">Sign up with Google</p>
                    </button>

                    <button className={styles.ButtonApple} onClick={() => signIn()} disabled={isAuthButtonDisabled}>
                        <FaApple />
                        <p className="ml-[1rem]">Sign up with Apple</p>
                    </button>

                    <button className={styles.ButtonEmail} onClick={() => signIn()} disabled={isAuthButtonDisabled}>
                        <FaEnvelope />
                        <p className="ml-[1rem]">Sign up with Email</p>
                    </button>
                </div>

                <div className="flex flex-row justify-center items-center mt-[2rem]">
                    <p>Already have an account?</p>
                    <button
                        onClick={onSwitchToLogin}
                        className="ml-[1rem] text-[0.9rem] font-bold text-[#5c8b1b] mt-1"
                    >
                        Log In
                    </button>
                </div>
            </form>
        </section>
    );
};

export default SignUp;