import { useCallback } from "react";
import { Redirect, Route, RouteComponentProps, RouteProps } from "react-router";
import { useAuth } from "./contexts/auth";

export const AuthRoute = ({ children, ...rest }: RouteProps) => {
  const { isAuthed } = useAuth();

  const render = useCallback(
    (routeProps: RouteComponentProps) => {
      return isAuthed ? (
        (children as React.ReactNode)
      ) : (
        <Redirect
          to={{ pathname: "/login", state: { from: routeProps.location } }}
        />
      );
    },
    [isAuthed]
  );

  return <Route {...rest} render={render} />;
};
