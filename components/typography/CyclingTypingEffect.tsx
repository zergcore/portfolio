import { useEffect, useState } from "react";
import TypingEffect from "./TypingEffect";
import UnderlinedGradientText from "./UnderlinedGradientText";

const CyclingTypingEffect = () => {
    const textsToDisplay = ['Software Engineer', 'Fullstack Developer'];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const animationDuration = 2000; // 2 seconds in milliseconds
        const cycleDuration = animationDuration * 2; // 4000ms or 4s

        // 5. Set a timer to change the text after the cycle duration
        const timerId = setTimeout(() => {
            // Calculate the next index, looping back to 0
            const nextIndex = (currentIndex + 1) % textsToDisplay.length;
            setCurrentIndex(nextIndex);
        }, cycleDuration);

        // 6. Cleanup function: Clear the timer if the component
        //    unmounts or if the effect re-runs before the timer finishes.
        return () => {
            clearTimeout(timerId);
        };

        // 7. Dependency Array: Re-run the effect whenever currentIndex changes
        //    or if the list of texts changes (though unlikely here)
    }, [currentIndex, textsToDisplay.length]);

    // Get the actual text string based on the current index
    const currentText = textsToDisplay[currentIndex];


    return (
        <TypingEffect key={currentText}>
            <UnderlinedGradientText>
                {currentText}
            </UnderlinedGradientText>
        </TypingEffect>
    );
};

export default CyclingTypingEffect;