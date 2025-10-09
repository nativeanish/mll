import Block from "@/Blocks/Block";
import AddBlock from "@/Blocks/studioBlock/AddBlock";
import BasicCard from "@/Blocks/studioBlock/BasicBlock";
import NavBar from "@/Blocks/UI/NavBar";

function Studio() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full">
        <NavBar />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-16">
        <div className="w-full min-h-screen flex flex-col lg:flex-row relative">
          <div className="w-full lg:w-[70%] lg:mr-[30%] overflow-y-auto min-h-screen p-4">
            <BasicCard />
            <AddBlock />
            <Block />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studio;
