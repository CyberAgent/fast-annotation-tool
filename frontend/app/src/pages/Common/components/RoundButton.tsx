import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  roundButton: {
    margin: "10px",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    // display: "flex",
    // flexDirection: "column",
    // justifyContent: "center",
    // cursor: "pointer",
  },
  roundButtonContent: {
    margin: "0 auto",
    "& *": {
      verticalAlign: "middle",
    },
  },
  buttonDesc: {
    fontSize: "0.7rem",
    textAlign: "center",
    color: "#757575",
    height: "1.5rem",
  },
}));

export const RoundButtonWithDesc: React.FC<{
  size: number;
  isDummy?: boolean;
  icon: React.ReactNode;
  description: string | React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  buttonKey?: string;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  disabled?: boolean;
}> = ({
  icon,
  size,
  isDummy,
  description,
  onClick,
  buttonKey,
  buttonRef,
  disabled,
}) => {
  const classes = useStyles();
  return (
    <div>
      <RoundButton
        size={size}
        isDummy={isDummy}
        onClick={onClick}
        buttonRef={buttonRef}
        buttonKey={buttonKey}
        disabled={disabled}
      >
        {icon}
      </RoundButton>
      <div className={classes.buttonDesc}>{!isDummy && description}</div>
    </div>
  );
};

export const RoundButton: React.FC<{
  size: number;
  isDummy?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  buttonKey?: string;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  disabled?: boolean;
}> = ({
  children,
  size,
  onClick,
  isDummy = false,
  buttonKey,
  buttonRef,
  disabled,
}) => {
  const classes = useStyles();
  const _style = {
    height: size,
    width: size,
    borderRadius: size / 2,
  };
  if (isDummy) {
    _style["opacity"] = 0;
  }

  return (
    <Fab
      style={_style}
      onClick={onClick}
      className={classes.roundButton}
      key={buttonKey}
      ref={buttonRef}
      disabled={disabled}
    >
      <div className={classes.roundButtonContent}>{children}</div>
    </Fab>
  );
};
