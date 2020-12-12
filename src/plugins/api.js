/* This file contains any calls to the backend. */

import Pizzly from "pizzly-js";

// API-Calls (functions return promises)
// A pizzy-object to make request to github
let pizzly = new Pizzly({
  host: "https://adr-manager.herokuapp.com",
  publishableKey: "dpWJ4TU2yCu7ys4Nb6eX5zhv32GV6YcVYYvDJZvS",
});

export async function getCommitSha(user, repoOwner, repoName, currentBranch) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .get("/repos/" + repoOwner + "/" + repoName + "/branches/" + currentBranch)
    .then((response) => response.json())
    .catch((err) => {
      console.log(err);
    });
}

export async function createBlobs(user, repoOwner, repoName, file) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .post("/repos/" + repoOwner + "/" + repoName + "/git/blobs", {
      body: JSON.stringify({ content: file, encoding: "utf-8" }),
    })
    .then((response) => response.json())
    .then((body) => body)
    .catch((err) => {
      console.log(err);
    });
}

export async function createFileTree(
  user,
  repoOwner,
  repoName,
  lastCommitSha,
  folderTree
) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .post("/repos/" + repoOwner + "/" + repoName + "/git/trees", {
      body: JSON.stringify({ base_tree: lastCommitSha, tree: folderTree }),
    })
    .then((response) => response.json())
    .then((body) => body)
    .catch((err) => {
      console.log(err);
    });
}

export async function createCommit(
  user,
  repoOwner,
  repoName,
  commitMessage,
  authorInfos,
  lastCommitSha,
  treeSha
) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .post("/repos/" + repoOwner + "/" + repoName + "/git/commits", {
      body: JSON.stringify({
        message: commitMessage,
        author: authorInfos,
        parents: [lastCommitSha],
        tree: treeSha,
      }),
    })
    .then((response) => response.json())
    .then((body) => body)
    .catch((err) => {
      console.log(err);
    });
}

export async function pushToGitHub(
  user,
  repoOwner,
  repoName,
  branch,
  newCommitSha
) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .post("/repos/" + repoOwner + "/" + repoName + "/git/refs/heads/" + branch, {
      body: JSON.stringify({
        ref: "refs/heads/" + branch,
        sha: newCommitSha,
      }),
    })
    .then((response) => response.json())
    .then((body) => body)
    .catch((err) => {
      console.log(err);
    });
}

/**
 * Returns a Promise with the list of all repositories accessible by the user.
 *
 * An example of the returned JSON structure can be found at 'https://api.github.com/users/adr/repos'
 * @param {string} user - the authID of user'
 * @returns {Promise<object[]>} the array of repos with attributes 'full_name', 'default_branch', etc.
 */
export async function loadRepositoryList(user) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .get("/user/repos")
    .then((response) => response.json())
    .catch((err) => {
      console.log(err);
    });
}

/**Returns a Promise with the the file tree of the repository.
 * The returned file tree is an array.
 * An example of the returned JSON structure can be found in the attribute 'tree' at 'https://api.github.com/repos/adr/madr/git/trees/master?recursive=1'
 *
 * @param {string} repoFullName - the full name of the repository, e.g. 'adr/madr'
 * @param {string} branch - the name of the branch, e.g. 'master'
 * @param {string} user - the authID of user'
 * @returns {Promise<object>} where the object has a tree attribute containing an array of all files in the repository
 */
export async function loadFileTreeOfRepository(repoFullName, branch, user) {
  user = localStorage.getItem('authId')
  return pizzly
    .integration("github")
    .auth(user)
    .get("/repos/" + repoFullName + "/git/trees/" + branch + "?recursive=1")
    .then((response) => response.json())
    .catch((err) => {
      console.log(err);
    });
}


/**Returns a Promise with the the file tree of the repository.
 * The returned file tree is an array. 
 * An example of the returned JSON structure can be found in the attribute 'tree' at 'https://api.github.com/repos/adr/madr/git/trees/master?recursive=1'
 * 
 * @param {string} repoFullName - the full name of the repository, e.g. 'adr/madr'
 * @param {string} user - the authID of user'
 * @returns {Promise<object>} where the object has a tree attribute containing an array of all files in the repository  
 */
export async function loadBranchesName(repoFullName, username, dataAuth) {
  dataAuth = localStorage.getItem('authId');
  return pizzly
    .integration("github")
    .auth(dataAuth)
    .get("/repos/" + username + "/" + repoFullName + "/branches?per_page=999")
    .then(response => response.json())
    .catch((err) => {
      console.log(err);
    });
}

/**
 * Returns a Promise with the the raw content of the file.
 *
 * The raw content is a string.
 *
 * (Currently the backend does not consider the branch but just sends content of default branch.)
 *
 * @param {string} repoFullName  - the full name of the repository, e.g. 'adr/madr'
 * @param {string} branch  - the name of the branch, e.g. 'master'
 * @param {string} filePath  - the name of the branch, e.g. 'docs/adr/0001-some-name.md'
 * @param {string} user  - the authID of the user'
 * @returns {Promise<string>} a promise with the raw content of the specified file
 */
export async function loadRawFile(repoFullName, branch, filePath, user) {
  user = localStorage.getItem('authId');
  if (typeof branch !== "string" || typeof branch != "string") {
    console.log(
      "Invalid values for loadContentsForRepository. Given Repository full name: " +
        repoFullName +
        ", Branch:" +
        branch +
        ", file path: " +
        filePath
    );
  } else {
    return pizzly
      .integration("github")
      .auth(user)
      .get("/repos/" + repoFullName + "/contents/" + filePath)
      .then((response) => response.json())
      .then((response) => decodeUnicode(response.content))
      .catch((err) => {
        console.log(err);
      });
  }
}

/** Decodes a base64 string to binary.
 * (Helper method when loading raw content)
 *
 * @param {string} str - a string encoded base64
 * @returns {string} the decoded string
 */
function decodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

/** Loads the content of all repositories.
 *
 * Each array entry is one repository with the following json-structure
 * {
 *  fullName: String,
 *  activeBranch: String,
 *  adrs: Array[ADR]
 * }
 * where an ADR has the structure
 * {
 *  path: String,
 *  originalMd: String,
 *  editedMd: String
 * }
 *
 * @param {object[]} repoList - each array entry must have the attributes fullName and branch
 * @param {string} user - the authID of user'
 * @returns {Promise<object[]>} an array of repositories
 */
export async function loadAllRepositoryContent(repoList, user) {
  user = localStorage.getItem('authId');
  let repoPromises = [];
  let adrPromises = [];
  let repoObjectList = repoList.map((repo) => {
    let repoFullName = repo.fullName;
    let branch = repo.branch;
    let repoObject = {
      fullName: repoFullName,
      activeBranch: branch,
      adrs: [],
    };
    repoPromises.push(
      loadFileTreeOfRepository(repoFullName, branch, user).then((data) => {
        // Find all files in the folder 'docs/adr' or 'doc/adr'
        let adrList = data.tree.filter((file) => {
          return (
            file.path.startsWith("docs/adr/") ||
            file.path.startsWith("doc/adr/")
          ); // Allow docs/adr and doc/adr as path .. maybe change this to demand mutual exclusion.
        });
        console.log("adrList", adrList);

        // Load the content of each ADR.
        adrList.forEach((adr) => {
          let adrObject = {
            path: adr.path,
          };
          repoObject.adrs.push(adrObject);
          adrPromises.push(
            loadRawFile(repoFullName, branch, adr.path, user, pizzly).then(
              (rawMd) => {
                adrObject.originalMd = rawMd;
                adrObject.editedMd = rawMd;
              }
            )
          );
        });
        console.log("adrList", repoObject.adrs);
      })
    )
    return repoObject
  })
  await Promise.all(repoPromises) // Wait until all file trees are loaded.
  await Promise.all(adrPromises) // Wait until all raw contents are loaded.
  return repoObjectList
}

/** Loads the content of all repositories.
 * 
 * Each array entry is one repository with the following json-structure
 * {
 *  fullName: String,
 *  activeBranch: String,
 *  adrs: Array[ADR]
 * }
 * where an ADR has the structure
 * {
 *  path: String,
 *  originalMd: String,
 *  editedMd: String
 * }
 * 
 * @param {object[]} repoList - each array entry must have the attributes fullName and branch
 * @param {string} user - the authID of user'
 * @returns {Promise<object[]>} an array of repositories
 */
export async function loadARepositoryContent(repoFullName, branchName, user) {
  user = localStorage.getItem('authId');

  let repoPromises = []
  let adrPromises = []
  let repoObject = {
    fullName: repoFullName,
    activeBranch: branchName,
    adrs: []
  }
 
    repoPromises.push(loadFileTreeOfRepository(repoFullName, branchName, user)
      .then((data) => {
        // Find all files in the folder 'docs/adr' or 'doc/adr'
        let adrList = data.tree.filter((file) => {
          return file.path.startsWith('docs/adr/') || file.path.startsWith('doc/adr/') // Allow docs/adr and doc/adr as path .. maybe change this to demand mutual exclusion.
        })
        console.log('adrList', adrList)

        // Load the content of each ADR.
        adrList.forEach((adr) => {
          let adrObject = {
            path: adr.path,
          }
          repoObject.adrs.push(adrObject)
          adrPromises.push(
            loadRawFile(repoFullName, branchName, adr.path, user, pizzly)
              .then((rawMd) => {
                adrObject.originalMd = rawMd;
                adrObject.editedMd = rawMd
              })
          )
        })
        console.log('adrList', repoObject.adrs)
      })
    )
  await Promise.all(repoPromises) // Wait until all file trees are loaded.
  await Promise.all(adrPromises) // Wait until all raw contents are loaded.
  return repoObject
}