# Video Assessments

A NodeJS application to create assessments for videos.  This application is run locally to edit 
the assessement questions for your video.

## Installation Summary

- Install [NodeJS](http://nodejs.org/)
- Install [Bower (globally)](http://bower.io/)
- Use Git to download this package (from [https://github.com/Wintellect/video-assessments.git]
(https://github.com/Wintellect/video-assessments.git)). 
- Run "npm install"
- Run "bower install"
- Run "npm start"
- Navigate (using a modern browser) to [http://localhost:19222/](http://localhost:19222/) 

## Installation on Windows

This tool requires NodeJS to run, but also requires Git in order to install the source
code and the packages that the tool depends on.  The easiest way to install a version of Git 
is to install GitHub for Windows.  This will give you a command line that can run Git, which will
allow you to download the source code and dependencies.

To install this tool on Windows:

- Install [NodeJS](http://nodejs.org/)

- Install [GitHub for Windows](https://windows.github.com/)

- GitHub for Windows can be used to work with GitHub repositories, but for our purposes we
just need the run the "Git Shell" (installed along with GitHub for Windows).  Once the
shell is open, you can make sure that NodeJS and Git are available by typing the commands:

```
node --version
git --version
```

- Install Bower in the NodeJS global package cache using the command:

```
npm install -g bower
```

- Clone (download) the Video Assessments repository using the command:

```
git clone https://github.com/Wintellect/video-assessments.git
```

- Make "video-assessments" the default directory using the command:

```
cd video-assessments
```

- Install the local node modules using the command:

```
npm install
```

- Install the required Javascript components using the command:

```
bower install
```

This completes the installation of the Video Assessments tool.  You only have to
do this once to get it installed (unless you want to update to a later version
at some point).

## Running the Video Assessments Tool

To run this tool, do the following:

- Open a command prompt.

- Make the "video-assessments" path the current directory.

- Run the tool using the command:

```
npm start
```

- Open a modern browser (like Google Chrome, this won't work in IE9 or earlier) and navigate to 
the path [http://localhost:19222/](http://localhost:19222/).

## Updating the Video Assessments Tool

If you wish to update the tool to the latest version, do the following:

- Make "video-assessments" the default directory using the command:

```
cd video-assessments
```

- Pull (download) the latest version of the Video Assessments repository using the command:

```
git pull
```

- Update the local node modules using the command:

```
npm install
```

- Update the required Javascript components using the command:

```
bower install
```

You can now run the application as described above.
