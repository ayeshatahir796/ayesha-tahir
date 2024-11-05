
$(document).ready(function () {
    const apiUrl = 'https://usmanlive.com/wp-json/api/stories';
    let currentStoryId = null; // Track the current story ID for editing

    // Function to fetch stories
    function fetchStories() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function (data) {
                $('#stories').empty();
                data.forEach(story => {
                    $('#stories').append(`
                        <div class="story" data-id="${story.id}">
                            <h3>${story.title}</h3>
                            <p>${story.content}</p>
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                    `);
                });
            }
        });
    }

    // Create a new story
    $('#story-form').submit(function (e) {
        e.preventDefault();

        const title = $('#title').val();
        const content = $('#content').val();

        if (currentStoryId) {
            // Update existing story
            $.ajax({
                url: `${apiUrl}/${currentStoryId}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ title, content }),
                success: function () {
                    fetchStories(); // Re-fetch stories to update the list
                    resetForm();  // Reset the form
                }
            });
        } else {
            // Create new story
            $.ajax({
                url: apiUrl,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ title, content }),
                success: function () {
                    fetchStories(); // Re-fetch stories to update the list
                    resetForm();  // Reset the form
                }
            });
        }
    });

    // Edit a story
    $('#stories').on('click', '.edit-btn', function () {
        const storyElement = $(this).closest('.story');
        currentStoryId = storyElement.data('id'); // Get the ID of the story to edit
        const title = storyElement.find('h3').text();
        const content = storyElement.find('p').text();

        $('#title').val(title);
        $('#content').val(content);
    });

    // Delete a story
    $('#stories').on('click', '.delete-btn', function () {
        const id = $(this).closest('.story').data('id');
        $.ajax({
            url: `${apiUrl}/${id}`,
            method: 'DELETE',
            success: function () {
                fetchStories(); // Re-fetch stories to update the list
            }
        });
    });

    // Reset the form
    function resetForm() {
        $('#title').val('');
        $('#content').val('');
        currentStoryId = null; // Reset the current story ID
    }

    // Initial fetch of stories
    fetchStories();
});





