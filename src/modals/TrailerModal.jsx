import React, { useEffect, useRef, useState } from "react";
import { useTrailerStore } from "../utilities/zustand/TrailerStore";
import { X } from "lucide-react";

const TrailerModal = () => {
  const { toggle , updateToggle } = useTrailerStore();
  const frameRef = useRef(null);
  const [videoURL,setVideoURL] = useState("https://www.youtube.com/embed/PBZjf6PP06k?si=_UYulrI17xLMfbFz");

  useEffect(()=>{
    if(frameRef.current != null && toggle){
      frameRef.current.src = videoURL;
    }
  },[toggle]);

  return (
    <div
        className={`${
          toggle ? "fixed" : "hidden"
        
      } z-51 min-h-screen bg-secondary inset-0 top-0 left-0 flex items-center justify-center`}
    >
        <div className="absolute inset-0 top-15 left-[50%] bg-secondary rounded-full size-10 flex items-center justify-center hover:cursor-pointer" onClick={()=>{
            const element = document.querySelector("#hero");
            element.scrollIntoView();
            frameRef.current.src = "";
            updateToggle(false);
        }}>
            <X className="text-tertiary size-7" />
        </div>
        <iframe
          className="h-full w-full"
          src={videoURL}
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          ref={frameRef}
        ></iframe>
    </div>
  );
};

export default TrailerModal;
