Upon signing up, you will be taken to the dashboard. The dashboard is where you can manage your entire workspace, including projects, users, and verified domains.

# Overview

<DocImage src="getting-started/content/dashboard/projects.png" alt="Project Overview" adaptive description="The Project Overview Screen" />

The primary dashboard view is the overview, which shows your projects. Projects group related API artifacts together, for example collections of requests, or various environments.

## Creating a Project

To create anyhing inside a project, click the Quickstart button, identified by the plus icon, and select the type of artifact you want to create.

<DocImage src="getting-started/content/dashboard/example-project.png" alt="Project Overview" adaptive description="An example project" />

To create your first project, click the <i>New Project</i> button on the overview page. You will be prompted to enter a name for your new project.

## Importing an Existing API

APITeam supports importing existing API definitions from a variety of sources, including Postman, and Insomnia. To do this, click <i>Quickstart</i>, then <i>Import</i>. This will automatically import an API definition from the source you select into Collections and Environments.

## Creating a Collection

Collections are used to group related API requests together, for example you might have a collection for your user API, and another for your product API.

By default, projects are created with a collction built-in, though you can create an unlimited number if you wish. To create a new collection, click <i>Quickstart</i>, then <i>New Collection</i>.

## Creating an Environment

Environments are used to store variables that can be used in your API requests. For example, you might have an environment for your production API, and another for your staging API. Environments are accessible from all collections in a project.

To create a new environment, click <i>Quickstart</i>, then <i>New Environment</i>.

# Verified Domains

Verified domains are used to proove your ownership of a domain. This is necessary to prevent abuse of the APITeam Cloud Network, by malicous actors. Verification of a domain is easily done by adding a TXT record to your DNS.

If you don't verify your DNS, your load tests will be limited to 10 requests per second. Upon verification, this limit is removed.

<!-- Verified domains can also be used to create custom domains for your API documentation. This allows you to host your API documentation at a custom domain, for example api.example.com. -->