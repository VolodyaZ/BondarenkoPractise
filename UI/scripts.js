class Post  {
	constructor(id, description, createdAt, author, photoLink, tags) {
		this.id = id;
		this.description = description;
		this.createdAt = createdAt;
		this.author = author;
		this.photoLink = photoLink;
		this.tags = tags;
	}
}

let posts = [
	new Post('1', 'descr', new Date('2020-03-17'), '1', 'images/time.png', ['news', 'pop']),
	new Post('2', 'descr', new Date('2020-03-17'), '1', 'images/time.png', ['news', 'pop']),
	new Post('3', 'descr', new Date('2020-03-17'), '1', 'images/natgeo.png', ['science', 'nature']),
	new Post('4', 'descr', new Date('2020-03-17'), '4', 'images/time.png', ['news', 'pop']),
	new Post('5', 'descr', new Date('2020-03-12'), '5', 'images/natgeo.png', ['science', 'nature']),
	new Post('6', 'descr', new Date('2020-03-19'), '6', 'images/natgeo.png', ['science', 'nature']),
	new Post('7', 'descr', new Date('2020-03-17'), '7', 'images/time.png', ['news', 'pop']),
];

let filteredPosts = getPosts();
let lastLoadedPost = -1;

function validatePost(post) {
	return post.hasOwnProperty('id') &&
	post.hasOwnProperty('description') &&
	post.hasOwnProperty('createdAt') &&
	post.hasOwnProperty('author') &&
	post.hasOwnProperty('photoLink') &&
	post.hasOwnProperty('tags');
}

function convertToShortDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	return (day < 10 ? '0' + day : day) + "." + 
			(month < 10 ? '0' + month : month) + "." +
			date.getFullYear();
}

function addPost(post) {
	if (validatePost(post)) {
		posts.push(post);
	}
}

function editPost(id, fieldsToChange) {
	let post = posts.find((p) => p.id === id);
	let keys = post.keys(post);
	keys.forEach( function(element, index) {
		if (fieldsToChange.hasOwnProperty(element)) {
			post[element] = fieldsToChange[element];
		}
	});

}

function deletePost(id) {
	for (let i = 0; i < posts.length; ++i) {
		if (posts[i].id === id) {
			posts.splice(i, i);
			break;
		}
	}
}

function getPosts(filterConfigs = null) {
	if (filterConfigs) {
		let tempPosts = posts;
		filterConfigs.forEach( function(element, index) {
			let key = Object.keys(element);
			if (key == "tags") {
				tempPosts = tempPosts.filter((a) => {
					for (let i = 0; i < element.tags.length; ++i) {
						for (let j = 0; j < a.tags.length; ++j) {
							if (element.tags[i] === a.tags[j]) {
								return true;
							}
						}
					}
					return false;
				});
			} else {
				tempPosts = tempPosts.filter((a) => !(a[key] < element[key]) && !(a[key] > element[key]));
			}
		});
		return tempPosts.sort((a, b) => a.createdAt - b.createdAt);
	}
	return posts.sort((a, b) => a.createdAt - b.createdAt);
}

function postToHTML(post) {
	let tagsStr = '';
	post.tags.forEach( function(element, index) {
		tagsStr += "#" + element + " ";
	});
	let str = `<div class="postHead">
					<p class="postinfo">${post.author}</p>
					<p class="postinfo">${convertToShortDate(post.createdAt)}</p>
					<div>
						<a href="editPost.html" class="menuRef">
							<img src="images/editPost.png" class="icon">
						</a>
						<img src="images/deletePost.png" onclick="onDelete(this)" class="icon">
					</div>
				</div>
				<div class="imagePart">
					<img src="${post.photoLink}" class="main">
					<div class="overlay"><img src="images/likeInactive.png" class="icon"></div>
				</div>
				<div class="postTitle">
					<h1 class="magName">Magazine name</h1>
					<div class="priceBox">$400</div>
				</div>
				<div class="stripe"></div>
				<div class="postBody">
					<p class="postDescr">${post.description}</p>
					<p class="tags">${tagsStr}</p>
				</div>
				<img src="images/upload.png" class="uploadImg">`;
	return str;
}

function loadPosts(amount) {
	let feed = document.getElementById("feed");
	let rightBound = Math.min(lastLoadedPost +  1 + amount, filteredPosts.length);
	for (let i = lastLoadedPost + 1; i < rightBound; ++i) {
		let tmp = postToHTML(filteredPosts[i]);
		let el = document.createElement('div');
		el.className = "post";
		el.setAttribute('data-id', filteredPosts[i].id);
		el.innerHTML = tmp;
		feed.appendChild(el);
		lastLoadedPost = i;
	}
	let btn = document.getElementById('loadbtn');
	if (lastLoadedPost >= filteredPosts.length - 1) {
		btn.disabled = true;
	} else {
		btn.disabled = false;
	}
}

function reloadPosts(amount) {
	lastLoadedPost = -1;
	let feed = document.getElementById("feed");
	feed.innerHTML = "";
	loadPosts(amount);
}

function onSearchBtnClick() {
	let filterConfigs = [];
	let authorCheckbox = document.getElementById('checkbox_name');
	if (authorCheckbox.checked) {
		let authorName = document.getElementById('search_name');
		filterConfigs.push({author: authorName.value});
	}

	let dateCheckbox = document.getElementById('checkbox_date');
	if (dateCheckbox.checked) {
		let date = document.getElementById('search_date');
		filterConfigs.push({createdAt: new Date(date.value)});
	}

	let tagsCheckbox = document.getElementById('checkbox_tags');
	if (tagsCheckbox.checked) {
		let tags = document.getElementById('search_hashtags').value;
		tags = tags.replaceAll('#', '');
		tags = tags.split(' ');
		filterConfigs.push({tags: tags});
	}

	filteredPosts = getPosts(filterConfigs);
	if (filteredPosts.length == 0) {
		alert("no posts found");
	} else {
		lastLoadedPost = -1;
		reloadPosts(10);
	}
}

function onChecked(checkbox, objToActivateId) {
	let objToActivate = document.getElementById(objToActivateId);
	objToActivate.disabled = !checkbox.checked;
	if (objToActivate.disabled) {
		objToActivate.value = "";
	}
}

function onDelete(deleteBtn) {
	let postNode = deleteBtn.parentNode.parentNode.parentNode;
	let id = postNode.getAttribute("data-id");
	let ind = posts.indexOf(posts.find((a) => a.id === id));
	posts.splice(ind, 1);
	reloadPosts(lastLoadedPost);
}