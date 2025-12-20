import { updateTask } from "../../services/Task.service";
import { AppDataSource } from "../../data-source";
import { HttpError } from "../../utils/HttpError";
import { getIO } from "../../socket";
import { TaskStatus } from "../../enums/TaskStatus";

jest.mock("../../data-source");
jest.mock("../../socket");

describe("updateTask service", () => {
  let queryRunner: any;
  let taskRepo: any;
  let logRepo: any;
  let notificationRepo: any;

  beforeEach(() => {
    taskRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    logRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    notificationRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn((entity) => {
          if (entity.name === "Task") return taskRepo;
          if (entity.name === "TaskStatusLog") return logRepo;
          if (entity.name === "Notification") return notificationRepo;
        }),
      },
    };

    (AppDataSource.createQueryRunner as jest.Mock).mockReturnValue(
      queryRunner
    );

    (getIO as jest.Mock).mockReturnValue({
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Assignee updates status
  it("should allow assignee to update status and create audit log", async () => {
    const task = {
      id: "task-1",
      title: "Test",
      status: "TODO",
      creatorId: "creator-1",
      assignedToId: "user-2",
      priority: "LOW",
    };

    taskRepo.findOne.mockResolvedValue(task);
    taskRepo.save.mockResolvedValue({ ...task, status: TaskStatus.COMPLETED });

    await updateTask(
      "task-1",
      { status: TaskStatus.COMPLETED },
      "user-2"
    );

    expect(taskRepo.save).toHaveBeenCalled();
    expect(logRepo.save).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  // Assignee cannot update title
  it("should block assignee updating non-status fields", async () => {
    const task = {
      id: "task-1",
      title: "Old",
      status: TaskStatus.TODO,
      creatorId: "creator-1",
      assignedToId: "user-2",
    };

    taskRepo.findOne.mockResolvedValue(task);

    await expect(
      updateTask(
        "task-1",
        { title: "New Title" },
        "user-2"
      )
    ).rejects.toThrow(HttpError);

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  // Status unchanged
  it("should not create audit log if status is unchanged", async () => {
    const task = {
      id: "task-1",
      status: TaskStatus.TODO,
      creatorId: "creator-1",
      assignedToId: "user-2",
    };

    taskRepo.findOne.mockResolvedValue(task);
    taskRepo.save.mockResolvedValue(task);

    await updateTask(
      "task-1",
      { status: TaskStatus.TODO },
      "creator-1"
    );

    expect(logRepo.save).not.toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  // Unauthorized user
  it("should throw 403 for unauthorized user", async () => {
    taskRepo.findOne.mockResolvedValue({
      id: "task-1",
      creatorId: "creator-1",
      assignedToId: "user-2",
    });

    await expect(
      updateTask("task-1", { status: TaskStatus.COMPLETED }, "user-3")
    ).rejects.toThrow(HttpError);

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
