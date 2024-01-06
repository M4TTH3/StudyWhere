let links = document.querySelectorAll(".links a");
let bodyID = document.querySelector("body").id;

for (let link of links) {
    if (link.CDATA_SECTION_NODE.active == bodyID) {
        link.classList.add("active");
    }
}