import React, { useEffect, useRef, useState } from "react";

interface State {
  pageNumber: number;
  isLoading: boolean;
  images: string[];
  imagesMap: string[][];
}

const options = {
  rootMargin: "500px 0px 0px 0px",
};

const App: React.FC = () => {
  const [state, setState] = useState<State>({
    pageNumber: 1,
    isLoading: false,
    images: [],
    imagesMap: [[], [], []],
  });

  const maxCols = useRef(0);
  const target = useRef(null);

  const setMaxCols = (): number => {
    if (window.innerWidth <= 600) {
      return 2;
    } else {
      return 3;
    }
  };

  const getColToStart = (): number => {
    let colToStart = 0,
      colsLength = state.imagesMap[0].length;
    for (let i = 0; i < maxCols.current; i++) {
      const min = Math.min(colsLength, state.imagesMap[i].length);
      if (min !== colsLength) {
        colsLength = min;
        colToStart = i;
      }
    }

    return colToStart;
  };

  const fetchImages = () => {
    if (state.isLoading) return;
    setState((prev) => ({ ...prev, isLoading: true }));

    fetch(
      `https://api.unsplash.com/photos/?client_id=n0m9fCcyNtFOR1NH_m-v3wX8lGPxPd2agoL4pd2w0KM&per_page=10&page=${state.pageNumber}`
    )
      .then((res) => {
        return res.json();
      })
      .then((res: { urls: { small: string } }[]) => {
        setState((prev) => {
          const { images, imagesMap } = prev;
          let colNumber = getColToStart();
          res.forEach(({ urls: { small } }) => {
            images.push(small);

            imagesMap[colNumber].push(small);
            colNumber++;

            if (colNumber === maxCols.current) {
              colNumber = 0;
            }
          });

          return {
            ...prev,
            isLoading: false,
            images,
            imagesMap,
            pageNumber: prev.pageNumber + 1,
          };
        });
      });
  };

  const onResize = () => {
    const currentMaxCols = setMaxCols();

    if (maxCols.current !== currentMaxCols) {
      maxCols.current = currentMaxCols;
      setState((prev) => ({ ...prev, isLoading: true }));
      let colNumber = 0;
      const imagesMap: string[][] = [[], [], []];

      state.images.forEach((image) => {
        imagesMap[colNumber].push(image);
        colNumber++;

        if (colNumber === currentMaxCols) {
          colNumber = 0;
        }
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        imagesMap,
      }));
    }
  };

  const callback: IntersectionObserverCallback = (entries, _) => {
    console.log({ state });
    entries.forEach((entry) => {
      if (entry.isIntersecting && !state.isLoading) {
        fetchImages();
      }
    });
  };

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    maxCols.current = setMaxCols();
    fetchImages();
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(callback, options);

    if (target.current && observer.current) {
      observer.current.observe(target.current);
    }

    return () => {
      if (target.current && observer.current) {
        observer.current.unobserve(target.current);
      }
    };
  }, [state.isLoading]);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [state.images]);

  return (
    <>
      <div className="container">
        {state.imagesMap.map((col, colIndex) => (
          <div key={colIndex} className="col">
            {col.map((image, index) => (
              <img src={image} key={`${colIndex}-${index}`} />
            ))}
          </div>
        ))}
      </div>
      <div ref={target} className="intersection"></div>
    </>
  );
};

export default App;
