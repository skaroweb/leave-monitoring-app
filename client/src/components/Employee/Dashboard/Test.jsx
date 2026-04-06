import { useState, useEffect } from "react";

const Test = ({ setState }) => {
  useEffect(() => {
    setState("helo");
  }, []);
  return <div>Test</div>;
};
export default Test;
