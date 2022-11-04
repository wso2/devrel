import { FC, useMemo } from "react";

type ChildProps = {
  username: string;
  message: string;
};

const Message: FC<ChildProps> = ({ username, message }: ChildProps) => {
  const initials = useMemo(() => {
    const fullName = username?.split(" ");

    if(fullName !== undefined && fullName?.length > 0) {
      // @ts-ignore - ts wrongly guess the full name might be undefined
      return fullName.shift().charAt(0) + fullName.pop().charAt(0).toUpperCase();
    }

    return null;
  }, [username]);

  return (
    <>
      <li className="flex items-center my-6 space-x-2">
        <a href="#" className="block relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="45px"
            height="45px"
            viewBox="0 0 64 64"
            version="1.1"
          >
            <circle
              fill="#E60000"
              width="64"
              height="64"
              cx="32"
              cy="32"
              r="32"
            />
            <text
              x="50%"
              y="50%"
              style={{
                color: "#ffffff",
                lineHeight: "1",
              }}
              alignment-baseline="middle"
              text-anchor="middle"
              font-size="26"
              font-weight="400"
              dy=".1em"
              dominant-baseline="middle"
              fill="#ffffff"
            >
              {initials}
            </text>
          </svg>
        </a>
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 font-semibold ml-2">
            {username}
          </span>
          <span className="text-sm text-gray-400 ml-2">{message}</span>
        </div>
      </li>
    </>
  );
};

export default Message;
