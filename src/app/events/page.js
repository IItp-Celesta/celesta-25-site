"use client";

import { useState } from "react";
import EventCard from "./event-card";
import EventModal from "./event-modal";
import styles from "./Events.module.css";
import data from "./events.json";

export default function Events() {
  const allEvents = data.events;
  const flagshipEvents = allEvents.slice(0, 8);
  const otherEvents = allEvents.slice(8);
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div
      className={`bg-muted flex flex-col min-h-screen gap-8 items-start justify-center w-full overflow-x-hidden px-4 sm:px-6 md:px-10 pb-40 ${styles.background} text-white relative`}
    >
      <div className="absolute inset-0 z-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white_100%)] pointer-events-none">
        <svg
          className="absolute inset-0 h-full w-full text-white"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M32 0H0V32"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              ></path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"></rect>
        </svg>
      </div>

      <h1 className="race font-bold text-5xl md:text-7xl text-center mb-12 mt-[15vh] bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 w-full uppercase">
        EVENTS
      </h1>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center py-20">
        {" "}
        <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-wider mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 state-wide">
          {" "}
          Coming Soon{" "}
        </h2>{" "}
        <div className="w-32 h-[2px] mb-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />{" "}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed">
          {" "}
          The events are being prepared. <br /> Stay tuned for the
          reveal.{" "}
        </p>{" "}
      </div>
      {/* Flagship Events Section */}
      {/* <div className="w-full max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white state-wide tracking-wider uppercase drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
          Flagship Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-36 w-full place-items-center">
          {flagshipEvents.map((event, idx) => (
            <EventCard
              key={`flagship-${idx}`}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      </div> */}

      {/* Other Events Section */}
      {/* <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white state-wide tracking-wider uppercase">
          Non Flagship Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-36 w-full place-items-center">
          {otherEvents.map((event, idx) => (
            <EventCard
              key={`other-${idx}`}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      </div> */}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
