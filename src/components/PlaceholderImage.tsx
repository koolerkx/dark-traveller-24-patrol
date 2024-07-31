import { IonImg, IonSkeletonText } from "@ionic/react";
import React, { useEffect } from "react";

interface Props {
  width?: string;
  height?: string;
  aspectRatio?: number;
  imageClassName?: string;
  src?: string;
  alt?: string;
}

export const PlaceholderImage: React.FC<Props> = ({
  width,
  height,
  aspectRatio,
  src,
  alt,
  imageClassName,
}) => {
  const [loaded, setLoaded] = React.useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = src ?? "";

    img.onload = () => {
      setLoaded(true);
    };
  }, [src]);

  return (
    <>
      <IonImg
        className={imageClassName}
        src={src}
        alt={alt}
        style={{
          display: loaded ? "block" : "none",
        }}
      />
      {!loaded ? (
        <IonSkeletonText
          style={
            width
              ? {
                  width: `${width}`,
                  aspectRatio: aspectRatio,
                }
              : {
                  height: `${height}`,
                  aspectRatio: aspectRatio,
                }
          }
          animated={true}
        />
      ) : null}
    </>
  );
};
