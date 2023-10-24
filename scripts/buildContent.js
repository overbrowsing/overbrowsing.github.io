import data from "../cache/data.json" assert { type: "json" };
        
const categoryButtons = document.querySelectorAll(".category-button");
const feedContainer = document.querySelector(".feed");

// Function to filter and update the displayed data by category
function filterDataByCategory(selectedCategory) {
    let filteredHtml = "";
    data.forEach(element => {
        if (!selectedCategory || element.category === selectedCategory) {
            filteredHtml += "<div>";
            if (element.title) {
                filteredHtml += "<h2>" + element.title + "</h2>";
            }
            if (element.content) {
                filteredHtml += "<p>" + element.content + "</p>";
            }
            if (element.image) {
                filteredHtml += "<img class='image' src='cache/images/" + element.id + ".png' loading='lazy' />";
            }
            filteredHtml += "</div>";
        }
    });
    feedContainer.innerHTML = filteredHtml;
}

// Add event listeners to the category buttons
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove 'selected' class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove("selected"));
        // Add 'selected' class to the clicked button
        button.classList.add("selected");
        const selectedCategory = button.getAttribute("data-category");
        filterDataByCategory(selectedCategory);
    });
});

// Initialize with "Design Tools" selected by default
filterDataByCategory("Design Tools");