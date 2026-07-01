import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

export const CustomInput: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      {...props}
      sx={{
        mb: 2,
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
        },
        ...props.sx,
      }}
    />
  );
};
