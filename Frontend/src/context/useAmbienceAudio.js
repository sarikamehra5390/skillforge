import { useContext } from "react";
import AmbienceAudioContext from "./AmbienceAudioContextValue";

export const useAmbienceAudio = () => {
  const context = useContext(AmbienceAudioContext);
  if (!context) throw new Error("useAmbienceAudio must be used within AmbienceAudioProvider");
  return context;
};
