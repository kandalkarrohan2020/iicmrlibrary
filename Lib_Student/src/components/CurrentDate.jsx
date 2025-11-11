import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const CurrentDate = () => {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formattedDate = format(now, "MMMM do yyyy, h:mm:ss a");
      setCurrentDate(formattedDate);
    };

    updateDate();

    const interval = setInterval(updateDate, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className="text-sm leading-5 font-semibold">
      {currentDate}
    </h2>
  );
};

export default CurrentDate;