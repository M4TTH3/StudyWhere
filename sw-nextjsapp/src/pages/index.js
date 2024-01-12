import React from "react";
import NavBar from "comp/navbar";
import Image from "next/image";
import styles from "@/styles/homepage.module.css";
import Map from "@/components/map";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const items = {
    sessionGallery: [
        {
            id: 1,
            title: "Choose Any Location in UWaterloo",
            text: "Choose 1 of 191 locations from the University of Waterloo!",
            imageUrl: "/sw-chooselocation.png",
        },
        {
            id: 2,
            title: "Customize your session!",
            text: "Let your friends know what is going on!",
            imageUrl: "/sw-createsession.png",
        },
        {
            id: 3,
            title: "Track your session!",
            text: "See how long you've been studying now!",
            imageUrl: "/sw-runningclock.png",
        },
    ],
};

const sessionFeatureText =
    "StudyWhere allows you to create a session to track and share whenever you study! " +
    "Share information such as where you're studying, tasks you plan to finish, and how busy the place is! " +
    "All these sessions will be shared to your friends via map, and everyone can track each other's current studying status. " +
    "You can select any location on the University of Waterloo OR customize it and use your current location.";

const friendFeatureText =
    "Studying alone? Why not spice it up and see where your friends are! Easily add your friends and track where they're currently " +
    "studying! Simply sign into google or create an account and add their email address!"

const mapFeatureText =
    "Bored studying all by yourself in DC? See where all your friends are! Have a live map on hand and view friends when they're studying! " +
    "This app ensures you'll never study alone again! "

const FeatureCarousel = ({ imagePath, gallery }) => {
    return (
        <>
            {gallery ? (
                <>
                    <Carousel
                        className={styles["feature-carousel"]}
                        showIndicators={true}
                        showArrows={true}
                        infiniteLoop={true}
                        autoPlay={true}
                        showThumbs={true}
                        swipeable={true}
                        emulateTouch={true}
                    >
                        {gallery.map((item) => {
                            return (
                                <>
                                    <div
                                        key={item.id}
                                        className={styles["feature-el"]}
                                    >
                                        <img
                                            className={styles["feature-image"]}
                                            src={item.imageUrl}
                                        />
                                        <div
                                            className={
                                                styles["feature-carousel-text"]
                                            }
                                        >
                                            <h3 className="font-semibold">
                                                {item.title}
                                            </h3>
                                            <p>{item.text}</p>
                                        </div>
                                    </div>
                                </>
                            );
                        })}
                    </Carousel>
                </>
            ) : (
                <>
                    <Image
                        src={imagePath}
                        alt="feature image"
                        className="my-auto mx-auto w-[90%] h-[65%]"
                        width={1000}
                        height={1000}
                    />
                </>
            )}
        </>
    );
};

const FeatureText = ({ text, title }) => {
    return (
        <div className={styles["feature-text"]}>
            <h2 className="text-[5em] font-bold">{title}</h2>
            <p className="text-[2em] font-semibold">{text}</p>
        </div>
    );
};

const FeaturePanel = ({
    text,
    title,
    imagePath,
    gallery,
    isTextLeft,
    colour,
}) => {
    return (
        <div
            className={`${styles["feature"]} ${
                colour == "white"
                    ? "bg-gray-200 text-black"
                    : "bg-slate-800 text-white"
            }`}
        >
            {isTextLeft ? (
                <>
                    <FeatureText title={title} text={text} />
                    <FeatureCarousel gallery={gallery} imagePath={imagePath} />
                </>
            ) : (
                <>
                    <FeatureCarousel gallery={gallery} imagePath={imagePath} />
                    <FeatureText title={title} text={text} />
                </>
            )}
        </div>
    );
};

export default function HomePage() {
    const demoUsers = {
        demo: {
            title: "Matthew: Finals Study Session",
            buildingName: "MC",
            roomName: "Mac Lab",
            latitude: 43.47207511,
            longitude: -80.54394739,
            tasks: ["Calculus", "CS"],
            times: [1704826573813],
            email: "demo@studywhere.ca",
            capacity: 5,
        },
    };

    return (
        <div className="HomePage scrollpage">
            <NavBar />
            <div className={`${styles["home-header"]}`}>
                <div className="ml-5 text-left text-[1em]">
                    <span className="text-gray-800 font-semibold">
                        Created By:{" "}
                    </span>
                    <span className="text-gray-700">Matthew Au-Yeung</span>
                </div>
                <a
                    href="https://github.com/M4TTH3/StudyWhere"
                    className={`text-[1em] ${styles["github"]}`}
                >
                    <Image
                        className="mx-auto shrink-0 w-[1em] h-[1em] my-auto"
                        src="/github-mark.png"
                        alt="Github Repo"
                        width={100}
                        height={100}
                    />
                    <span className="mx-auto">Github Repo</span>
                </a>
            </div>
            <div className={`${styles["home-body"]}`}>
                <h1 className="text-[2em] mt-20 font-bold z-1">StudyWhere</h1>
                <h2>Are you struggling to find a study spot?</h2>
                <div className={`${styles["demo-map"]}`}>
                    <Map demoSessions={demoUsers} />
                </div>
                <div>
                    <span className="font-bold">
                        {"See where your friends study! "}
                    </span>
                    <span className="">{"(view demo above)"}</span>
                </div>
            </div>
            <div className={`${styles["spacer"]}`}></div>
            <FeaturePanel
                gallery={items.sessionGallery}
                text={sessionFeatureText}
                title={"Sessions"}
            />
            <FeaturePanel
                title="Friends"
                text={friendFeatureText}
                imagePath={"/sw-friends.png"}
                isTextLeft={true}
                colour="white"
            />
            <FeaturePanel
                title="Live Map!"
                text={mapFeatureText}
                imagePath='/sw-viewmap.png'
            />
        </div>
    );
}
