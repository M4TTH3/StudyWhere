import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "@/authConfig/authConfig";
import { useRouter } from "next/router";

function Login() {
    const isAuthenticated = useIsAuthenticated();

    const { instance } = useMsal();

    const SignInButton = () => {
        const handleLogin = () => {
            instance
                .loginRedirect(loginRequest)
                .catch((error) => console.log(error));
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

    const router = useRouter();
    const navbarRef = useRef(null);

    useEffect(() => {
        // Set current Link to have classname active
        const path = router.pathname;
        for (let child of navbarRef.current.children) {
            // Remove the http and compare the path
            const href = child.href?.replace(/(https?:\/\/(?:localhost:3000|studywhere\.ca)\/*)/g, '/')
            child.className = href == path ? 'active': ''
        }
    }, [router, navbarRef]);


    return (
        <nav id="navbar" ref={navbarRef}>
            <Link href="/">
                {/* <img src={'StudyWhere Logo.png'} id="Logo"></img> */}
                <NavbarItem tab="Home" />
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
