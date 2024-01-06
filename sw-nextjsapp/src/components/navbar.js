import Link from "next/link";
import React from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "@/authConfig/authConfig";

function Login() {
    const isAuthenticated = useIsAuthenticated();

    const { instance } = useMsal();

    const SignInButton = () => {
        const handleLogin = () => {
            instance
                .loginRedirect(loginRequest)
                .catch((error) => console.log(error));
            console.log("hi");
        };

        return (
            <button id="login" className="tabcontainer" onClick={handleLogin}>
                Sign In
            </button>
        );
    };

    const SignOutButton = () => {
        const handleLogout = () => {
            instance.logoutRedirect({});
        };

        return (
            <button id="logout" className="tabcontainer" onClick={handleLogout}>
                Logout
            </button>
        );
    };

    return <>{isAuthenticated ? <SignOutButton /> : <SignInButton />}</>;
}

const NavbarItem = ({ tab }) => {
    return (
        <>
            <div className="tabcontainer">{tab}</div>
        </>
    );
};

const NavBar = () => {
    return (
        <nav id="navbar">
            <Link href="/">
                <img src={'StudyWhere Logo.png'} id="Logo"></img>
            </Link>
            <Link href="/map">
                <NavbarItem tab="Map" />
            </Link>
            <Link href="/friends">
                <NavbarItem tab="Friends" />
            </Link>
            <Link href="/session">
                <NavbarItem tab="Sessions" />
            </Link>
            <Login></Login>
        </nav>
    );
};

export default NavBar;
