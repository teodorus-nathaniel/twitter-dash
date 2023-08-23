const userList = document.getElementById('user-list')
const prevBtn = document.getElementById('prev-btn')
const nextBtn = document.getElementById('next-btn')
const paginationNotice = document.getElementById('pagination-notice')
const rightSection = document.getElementById('right-section')
const logoMobile = document.getElementById('logo-mobile')
const searchForm = document.getElementById('search-form')
const searchMobile = document.getElementById('search-desktop')
const searchDesktop = document.getElementById('search-mobile')

const limit = 10
let currentPage = 1
let totalData = 0

let selectedUser

fetchUsers(currentPage)

function updatePagination() {
  const startIndex = (currentPage - 1) * limit + 1
  paginationNotice.innerHTML = `
    Showing ${startIndex}-${Math.min(
    startIndex + limit - 1,
    totalData
  )}<br />from ${totalData} results
  `

  nextBtn.disabled = !totalData || currentPage * limit >= totalData
  prevBtn.disabled = currentPage === 1
}

prevBtn.addEventListener('click', () => {
  if (currentPage === 1) return
  currentPage--
  fetchUsers(currentPage)
})
nextBtn.addEventListener('click', () => {
  if (!totalData || currentPage * limit >= totalData) return
  // 50 data => 40 => 4
  currentPage++
  fetchUsers(currentPage)
})

function fetchUsers(page, search) {
  const skip = (page - 1) * limit
  // 1 => (1 - 1) * 10 => 0
  // 2 => (2 - 1) * 10  => 10
  // 3 => (3 - 1) * 10  => 20
  let fetchUrl = `https://dummyjson.com/users?limit=${limit}&skip=${skip}`
  if (search) {
    fetchUrl = `https://dummyjson.com/users/search?q=${search}&limit=${limit}&skip=${skip}`
  }
  fetch(fetchUrl)
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      totalData = data.total
      const users = data.users
      const childrenStringArray = users.map(
        (user) => `
        <div class="user-card" id="user-card-${user.id}">
          <div class="user-card-content">
            <img
              class="user-avatar"
              src=${user.image}
              alt=""
            />
            <div class="user-card-text-container">
              <div class="user-card-name">
                <span>${user.firstName + ' ' + user.lastName}</span>
                <img src="${
                  user.gender === 'male'
                    ? './img/male.webp'
                    : './img/female.png'
                }" alt=${user.gender} />
              </div>
              <span class="user-card-email">${user.email}</span>
            </div>
          </div>
          <div class="user-card-arrow">
            <span class="material-symbols-outlined">chevron_right</span>
          </div>
        </div>
      `
      )
      userList.innerHTML = childrenStringArray.join('')

      users.forEach((user) => {
        const id = `user-card-${user.id}`
        const element = document.getElementById(id)
        element.addEventListener('click', () => {
          const prevSelectedUser = selectedUser
          element.classList.add('active')
          selectedUser = user
          updateDetail()

          if (prevSelectedUser) {
            const prevElementId = `user-card-${prevSelectedUser.id}`
            const prevElement = document.getElementById(prevElementId)
            if (prevElement) prevElement.classList.remove('active')
          }
        })
      })

      updatePagination()
    })
}

async function updateDetail() {
  if (!selectedUser) {
    // TODO: render no data selected UI
  }

  const res = await fetch(
    `https://dummyjson.com/users/${selectedUser.id}/posts`
  )
  const postData = await res.json()
  console.log(postData)

  rightSection.classList.add('active')

  const postStringArray = postData.posts.map(
    (post) => `
    <div class="post">
      <span>${post.title}</span>
      <p>
        ${post.body}
      </p>
      <div class="tags-container">
        ${post.tags.map((tag) => `<span>${tag}</span>`).join('')}
      </div>
    </div>
  `
  )

  const content = `
  <div class="user-detail">
    <div class="user-card-content">
      <img
        class="user-avatar"
        src=${selectedUser.image}
        alt=""
      />
      <div class="user-card-text-container">
        <div class="user-card-name">
          <span>${selectedUser.firstName + ' ' + selectedUser.lastName}</span>
          <img src="${
            selectedUser.gender === 'male'
              ? './img/male.webp'
              : './img/female.png'
          }" alt=${selectedUser.gender} />
        </div>
        <span class="user-card-email">${selectedUser.email}</span>
      </div>
    </div>
    <div class="user-detail-grid">
      <div><span>Education</span><span>${selectedUser.university}</span></div>
      <div>
        <span>Address</span
        ><span>${
          selectedUser.address.address + ', ' + selectedUser.address.city
        }</span>
      </div>
      <div><span>Occupation</span><span>${
        selectedUser.company.title
      }</span></div>
      <div><span>Company Name</span><span>${
        selectedUser.company.name
      }</span></div>
    </div>
  </div>

  <div class="user-posts">
    <h2>${selectedUser.firstName}'s Posts</h2>
    <div class="posts-list">
      ${postStringArray.join('')}
    </div>
  </div>
  `

  rightSection.innerHTML = content
  if (logoMobile) {
    logoMobile.innerHTML = `
      <button class="mobile-only searchbutton button" id="back-btn">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span>Back</span>
    `

    const backButton = document.getElementById('back-btn')
    backButton.addEventListener('click', () => {
      logoMobile.innerHTML = `
        <img src="./img/twitter.png" alt="" />
        <span>TwitterDash</span>
      `
      rightSection.classList.remove('active')

      const elementId = `user-card-${selectedUser.id}`
      const element = document.getElementById(elementId)
      if (element) element.classList.remove('active')
    })
  }
}

const searchButton = document.getElementById('searchbutton')
const searchBarMobile = document.getElementById('searchbar-mobile')
searchButton.addEventListener('click', () => {
  searchBarMobile.classList.add('active')

  const searchClose = document.getElementById('close-btn')
  searchClose.addEventListener('click', () => {
    searchBarMobile.classList.remove('active')
  })
})

searchForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const searchDesktopValue = searchDesktop.value
  const searchMobileValue = searchMobile.value
  // const search = searchDesktopValue ? searchDesktopValue : searchMobileValue
  const search = searchDesktopValue || searchMobileValue

  currentPage = 1
  fetchUsers(currentPage, search)
  searchBarMobile.classList.remove('active')
})
