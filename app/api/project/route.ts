import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, initialPrompt } = await request.json();

    const result = await prisma.project.create({
      data: {
        userId,
        name: initialPrompt ? initialPrompt.slice(0, 50) : "New Project",
        initialPrompt: initialPrompt ?? "",
      },
    });

    return new Response(
      JSON.stringify({ message: "Project created successfully", data: result }),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return new Response(JSON.stringify({ error: "Failed to create project" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return Response.json(
        {
          error: "Project ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return Response.json(
        {
          error: "Project not found",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(
      {
        message: "Project fetched successfully",
        data: project,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching project:", error);

    return Response.json(
      {
        error: "Failed to fetch project",
      },
      {
        status: 500,
      },
    );
  }
}
