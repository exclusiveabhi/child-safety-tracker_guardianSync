import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16">
        <div>
          <h1 className="text-2xl font-bold text-[#A020F0]">
            Guardian<span className="text-[#008000]">Sync</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 ">
          {/* <Link to="/home"><Button variant="outline">Home</Button></Link>*/}

          <div className="flex items-center gap-2 ">
            <Link to="/map">
              <Button variant="outline">where is my child</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
