const images = new Array(100).fill(
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNTk3NzZ8MXwxfGFsbHwxfHx8fHx8Mnx8MTYzMTI5MDcyMA&ixlib=rb-1.2.1&q=80&w=1080"
);

let maxCols = 0;
const setMaxCols = () => {
  if (window.innerWidth <= 600) {
    maxCols = 2;
  } else {
    maxCols = 3;
  }
};

setMaxCols();

const colDivElements = document.querySelectorAll(".col");
let j = 0;

const addImages = () => {
  for (let i = pageNumber * 10 - 10; i < pageNumber * 10; i++) {
    const imageElement = document.createElement("img");
    imageElement.src = images[i];
    imageElement.alt = i;

    if (j <= 3) {
      colDivElements[j].appendChild(imageElement);
      j++;

      if (j === 3) {
        j = 0;
      }
    }
  }
  pageNumber++;
};

// addImages();

let pageNumber = 1;

let isLoading = false;
let colNumber = 0;

const imagesArray = [];

const fetchImages = () => {
  fetch(
    `https://api.unsplash.com/photos/?client_id=n0m9fCcyNtFOR1NH_m-v3wX8lGPxPd2agoL4pd2w0KM&per_page=10&page=${pageNumber}`
  )
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      res.forEach(({ urls: { small } }, index) => {
        imagesArray.push(small);

        const imageElement = document.createElement("img");
        imageElement.src = small;
        imageElement.alt = index;

        colDivElements[colNumber].appendChild(imageElement);
        colNumber++;

        if (colNumber === maxCols) {
          colNumber = 0;
        }
      });

      isLoading = false;
    });

  pageNumber++;
};

fetchImages();

const callback = (entries, _) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !isLoading) {
      isLoading = true;

      fetchImages();
    }
  });
};

const options = {
  rootMargin: "500px 0px 0px 0px",
};

const observer = new IntersectionObserver(callback, options);

const target = document.querySelector(".intersection");
observer.observe(target);

let previousMaxCols = maxCols;

window.addEventListener("resize", () => {
  setMaxCols();

  if (previousMaxCols !== maxCols) {
    isLoading = true;
    colDivElements.forEach((col) => {
      col.innerHTML = "";
    });
    colNumber = 0;
    previousMaxCols = maxCols;
    imagesArray.forEach((small, index) => {
      const imageElement = document.createElement("img");
      imageElement.src = small;
      imageElement.alt = index;

      colDivElements[colNumber].appendChild(imageElement);
      colNumber++;

      if (colNumber === maxCols) {
        colNumber = 0;
      }
    });
    setTimeout(() => {
      isLoading = false;
    }, 5000);
  }
});
